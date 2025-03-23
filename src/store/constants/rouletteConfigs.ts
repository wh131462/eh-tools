import {RouletteConfig} from "@/store/slices/rouletteSlice";

export const eatToday: RouletteConfig = {
  id: "1",
  name: "今天吃什么?",
  items: [
    {id: "1", name: "炸鸡"},
    {id: "2", name: "汉堡"},
    {id: "3", name: "烤鱼"},
    {id: "4", name: "烤鸡"},
    {id: "5", name: "炸串"},
    {id: "6", name: "烤肉"},
    {id: "7", name: "红烧牛肉面"},
    {id: "8", name: "米村拌饭"},
  ],
  createTime: Date.now(),
  description: "选择困难症者的福音"
}


export const languageSelect: RouletteConfig = {
  id: "2",
  name: "选择什么语言?",
  items: [
    {id: "1", name: "C++"},
    {id: "2", name: "C#"},
    {id: "3", name: "JAVA"},
    {id: "4", name: "PHP"},
    {id: "5", name: "JavaScript"},
    {id: "6", name: "TypeScript"},
    {id: "7", name: "python"},
    {id: "8", name: "Go"},
  ],
  createTime: Date.now(),
  description: "你就学吧!"
}
