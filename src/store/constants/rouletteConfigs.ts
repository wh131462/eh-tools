import {RouletteConfig} from "@/store/slices/rouletteSlice";

export const eatToday: RouletteConfig = {
  id: "1",
  name: "今天吃什么?",
  items: [{id: "1", name: "煎饼果子"}, {id: "2", name: "摇摇奶昔"}],
  createTime: 0,
  description: "选择困难症者的福音"
}
