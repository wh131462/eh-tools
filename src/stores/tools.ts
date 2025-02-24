import {defineStore} from "pinia";
import {ref} from "vue";

export interface ITool {
  id: string;
  name: string;
  path: string;
  icon: string;
}

export const useTools = defineStore('tools', () => {
  const tools = ref<ITool[]>([])

  function addTool(tool: ITool | ITool[]) {
    if (Array.isArray(tool)) {
      tools.value.push(...tool)
    } else {
      tools.value.push(tool)
    }
  }

  function removeTool(id: string) {
    const index = tools.value.findIndex(o => o.id === id);
    if (index > -1) {
      tools.value.splice(index, 1)
    }
  }

  return {tools, addTool, removeTool}
})
