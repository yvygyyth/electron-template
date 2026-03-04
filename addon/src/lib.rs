#![deny(clippy::all)]

use napi::bindgen_prelude::{Unknown, *};
use napi_derive::napi;
use std::convert::TryInto;
use std::ptr;

// ============================================================
// 1. 常量和嵌入字节码 (无变化)
// ============================================================

// const XOR_KEY: u8 = 123;
const MAIN_BYTECODE: &[u8] = include_bytes!("../../dist-electron/main/index.jsc");
const PRELOAD_BYTECODE: &[u8] = include_bytes!("../../dist-electron/preload/index.jsc");

// ============================================================
// 2. 核心执行逻辑 (已更新)
// ============================================================

/// 辅助函数：在 Rust 中实现 module.require("...")
/// 【已修正】使用现代化 API
// 1. 【生命周期修正】返回的 Object 的生命周期需要和输入的 Env/Object 绑定。
//    使用 <'a> 明确指定这一点。

pub fn node_require<'a>(module: &'a Object, id: &str) -> Result<Object<'a>> {
  // 【修正】必须使用 JsFunction 来处理动态获取的函数
  let require_fn: Function<&'a str> = module.get_named_property("require")?;

  // JsFunction 的 call 方法签名是 (this, args)，这现在是正确的
  let required_module: Object<'a> = require_fn.call(id)?.coerce_to_object()?;
  Ok(required_module)
}

// fn call_constructor<'a>(
//   env: &'a Env,
//   constructor: &'a Function<'a>,
//   args: &'a [Unknown<'a>],
// ) -> Result<Object<'a>> {
//   let mut result = ptr::null_mut();
//   let mut raw_args: Vec<napi::sys::napi_value> = args.iter().map(|arg| arg.raw()).collect();

//   unsafe {
//     let status = napi::sys::napi_new_instance(
//       env.raw(),
//       constructor.raw(),
//       args.len(),
//       raw_args.as_mut_ptr(),
//       &mut result,
//     );

//     if status != napi::sys::Status::napi_ok {
//       return Err(Error::new(
//         Status::GenericFailure,
//         format!("Failed to create instance: {:?}", status),
//       ));
//     }

//     println!("call_constructor result: {:?}", result);

//     Ok(Object::from_raw(env.raw(), result))
//   }
// }

/// 详细地、分步骤地执行字节码的核心函数 (已更新)
fn execute_bytecode_step_by_step(
  env: Env,
  module: Object,
  bytecode: &[u8],
  name: &str,
) -> Result<Unknown<'static>> {
  println!("[RUST] Executing '{}' in step-by-step mode.", name);

  // --- 步骤 1: 字节码解混淆 (无变化) ---
  let mut data = bytecode.to_vec();
  // for byte in &mut data {
  //     *byte ^= XOR_KEY;
  // }
  println!(
    "[RUST] Step 1: Bytecode de-obfuscated ({} bytes).",
    data.len()
  );

  // --- 步骤 2: 获取 Node.js 核心模块 (无变化) ---
  let vm_module = node_require(&module, "vm")?;
  let v8_module = node_require(&module, "v8")?;
  println!("[RUST] Step 2: Required 'vm' and 'v8' modules.");

  // --- 步骤 3: 设置 V8 Flags (API 调用简化) ---
  let set_flags_fn: Function<&str> = v8_module.get_named_property("setFlagsFromString")?;
  // 直接传递 &str，无需手动创建 JsString
  set_flags_fn.call(&"--no-lazy")?;
  set_flags_fn.call(&"--no-flush-bytecode")?;
  println!("[RUST] Step 3: V8 flags '--no-lazy' and '--no-flush-bytecode' set.");

  // --- 步骤 4: 动态生成并应用 "Fix Code" (API 更新) ---
  let script_constructor: Function = vm_module.get_named_property("Script")?;

  println!("[RUST] script_constructor");

  // 【更新】使用 Object::new(env) 代替 env.create_object()
  let mut dummy_script_options = Object::new(&env)?;
  // 【更新】直接传递 bool 值，无需 env.get_boolean()
  dummy_script_options.set("produceCachedData", true)?;

  println!("[RUST] dummy_script_options");

  let arg0: Unknown = env.create_string("")?.to_unknown();
  let arg1: Unknown = dummy_script_options.to_unknown();

  // let args: Unknown = vec![arg0, arg1];
  let args = &[arg0, arg1];

  println!("[RUST] args");

  let dummy_script_instance: Object = script_constructor.new_instance(arg0)?.coerce_to_object()?;

  // let empty_code = env.create_string("")?;
  // let args = vec![empty_code.to_unknown(), dummy_script_options.to_unknown()];

  // 【更新】直接传递 &str 和 &JsObject 作为参数
  // let dummy_script_instance = call_constructor(&env, &script_constructor, &args)?;

  println!("[RUST] dummy_script_instance",);

  let create_cached_data_fn: Function<'_, (), Buffer> =
    dummy_script_instance.get_named_property("createCachedData")?;

  println!("[RUST] create_cached_data_fn");

  let dummy_bytecode_buffer: Buffer = create_cached_data_fn.call(())?;

  println!("[RUST] dummy_bytecode_buffer");

  let fix_code_slice = &dummy_bytecode_buffer.as_ref()[12..16];

  println!("[RUST] fix_code_slice");

  if data.len() >= 16 {
    data[12..16].copy_from_slice(fix_code_slice);
    println!("[RUST] Step 4: 'Fix Code' (V8 Flags Hash) generated and applied.");
  } else {
    return Err(Error::new(
      Status::GenericFailure,
      "Bytecode is too short to apply Fix Code.".to_string(),
    ));
  }

  // --- 步骤 5: 根据 Source Hash 生成 "假源码" (无变化) ---
  let source_len = if data.len() >= 12 {
    u32::from_le_bytes(data[8..12].try_into().unwrap())
  } else {
    return Err(Error::new(
      Status::GenericFailure,
      "Bytecode is too short to read Source Hash.".to_string(),
    ));
  };

  let dummy_code_str = if source_len > 1 {
    format!("\"{}\"", "\u{200b}".repeat((source_len - 2) as usize))
  } else {
    "\"\"".to_string()
  };
  println!(
    "[RUST] Step 5: Dummy source code generated (length: {}).",
    source_len
  );

  let script_constructor2: Function<Vec<napi::Unknown<'_>>> =
    vm_module.get_named_property("Script")?;

  // --- 步骤 6: 创建最终的 vm.Script 并运行 (API 更新) ---
  let final_cached_data = Buffer::from(data);

  // 【更新】使用 Object::new(env)
  let mut script_options = Object::new(&env)?;
  // 【更新】直接传递 &str
  script_options.set("filename", name)?;
  script_options.set("cachedData", final_cached_data)?;

  let arg2: Unknown = env.create_string(dummy_code_str)?.to_unknown();
  let arg3: Unknown = script_options.to_unknown();

  let args2: Vec<Unknown> = vec![arg2, arg3];

  // 【更新】直接传递 &String 和 &JsObject
  let final_script: Object = script_constructor2
    .new_instance(args2)?
    .coerce_to_object()?;

  let rejected: bool = final_script.get_named_property::<bool>("cachedDataRejected")?;
  if rejected {
    return Err(Error::new(
            Status::GenericFailure,
            "FATAL: Bytecode was rejected by V8. (cachedDataRejected: true). Check Node/Electron/V8 versions."
        ));
  }
  println!("[RUST] Step 6.1: Final vm.Script created, cachedData was accepted.");

  let run_fn: Function = final_script.get_named_property("runInThisContext")?;
  println!("[RUST] Step 6.2: Executing final script via runInThisContext...");

  run_fn.call(final_script.to_unknown())
}

// ============================================================
// 3. 导出的 N-API 函数 (无变化)
// ============================================================

#[napi]
pub fn run_protected_main(env: Env, module: Object) -> Result<Unknown<'static>> {
  execute_bytecode_step_by_step(env, module, MAIN_BYTECODE, "main")
}

#[napi]
pub fn run_protected_preload(env: Env, module: Object) -> Result<Unknown<'static>> {
  execute_bytecode_step_by_step(env, module, PRELOAD_BYTECODE, "preload")
}

#[napi]
pub fn get_version() -> String {
  env!("CARGO_PKG_VERSION").to_string()
}

#[napi]
pub fn has_embedded_bytecode() -> bool {
  !MAIN_BYTECODE.is_empty() && !PRELOAD_BYTECODE.is_empty()
}
