// hooks/usePageTitle.ts
import {useDidShow, useShareAppMessage, useShareTimeline} from '@tarojs/taro'
import {DependencyList, useEffect} from 'react'
import {updatePageTitle} from "@/i18n/utils";
import {useAppSelector} from "@/store/hooks";

export function usePageTitle(pageKey: string) {
  const {language, shares} = useAppSelector(state => state.app);
  // 监听页面显示事件
  useDidShow(() => {
    updatePageTitle(language, pageKey)
  })
  // 监听 language 变化
  useEffect(() => {
    updatePageTitle(language, pageKey)
  }, [language, pageKey] as DependencyList)
  if (shares[pageKey]) {
    useShareAppMessage(() => {
      return shares[pageKey]
    });
    useShareTimeline(() => {
      return shares[pageKey]
    });
  }

}
