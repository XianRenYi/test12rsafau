<template>
  <div style="border: 0px solid #ebebeb; overflow: hidden; border-radius: 6px; background-color: #ebebeb; padding: 8px 5px 8px 0">
    <VueAceEditor
      ref="codeEditorRef"
      v-model:value="currentContent"
      @init="editorInit"
      :options="options"
      :lang="lang"
      :theme="codeStyle"
      :style="{ width, height }"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { VAceEditor as VueAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-groovy'
import 'ace-builds/src-noconflict/mode-mysql'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/snippets/groovy'
import 'ace-builds/src-noconflict/snippets/json'
import 'ace-builds/src-noconflict/ext-beautify'

const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '500px'
  },
  content: {
    type: String,
    required: true,
    default: () => ''
  },
  lang: {
    type: String,
    default: 'groovy'
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  codeStyle: {
    type: String,
    default: 'chrome'
  },
  codeSize: {
    type: Number,
    default: 13
  }
})

const emit = defineEmits(['update:content'])

const codeEditorRef = ref<any>(null)

const options = ref({
  autoScrollEditorIntoView: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
  readOnly: props.readOnly,
  showPrintMargin: false,
  fontSize: props.codeSize
})

const currentContent = computed({
  get: () => props.content,
  set: (val) => {
    emit('update:content', val)
  }
})

watch(() => props.codeSize, (value) => {
  if (codeEditorRef.value?.editor) {
    codeEditorRef.value.editor.setOptions({
      fontSize: value
    })
  }
})

const editorInit = () => {
  // 初始化逻辑已通过直接导入实现
}

const format = () => {
  if (codeEditorRef.value?.editor) {
    const beautify = ace.acequire('ace/ext/beautify')
    beautify.beautify(codeEditorRef.value.editor.session)
  }
}

// 暴露方法给父组件
defineExpose({
  format
})
</script>