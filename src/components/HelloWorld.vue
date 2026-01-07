<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import type { ThemeConfig } from '@share/index'
import { ConfigIpcHandler, ConfigKeys } from '@share/index'

defineProps<{ msg: string }>()

const themeConfig = ref<ThemeConfig>({
    fontSize: 0
})

const updateThemeConfig = async () => {
    themeConfig.value.fontSize++
    await window.ipcRenderer.invoke(ConfigIpcHandler.update, {
        key: ConfigKeys.THEME,
        value: toRaw(themeConfig.value)
    })
}

onMounted(async () => {
    const data = await window.ipcRenderer.invoke(ConfigIpcHandler.get, ConfigKeys.THEME)
    // 现在 data.value 的类型会自动推断为 ThemeConfig，无需类型断言
    themeConfig.value = data.value as ThemeConfig
})
</script>

<template>
    <h1>{{ msg }}</h1>

    <div class="card">
        <button type="button" @click="updateThemeConfig">count is {{ themeConfig.fontSize }}</button>
        <p>
            Edit
            <code>components/HelloWorld.vue</code> to test HMR
        </p>
    </div>

    <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>, the official Vue + Vite
        starter
    </p>
    <p>
        Install
        <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
        in your IDE for a better DX
    </p>
    <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
