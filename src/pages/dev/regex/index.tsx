import {View} from '@tarojs/components'
import {useState} from 'react'
import {Cell, Input, TextArea, VirtualList} from "@nutui/nutui-react-taro";

const RegexTester = () => {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [matches, setMatches] = useState<string[]>([])

  const commonPatterns = [
    {name: '邮箱', pattern: '^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$'},
    {name: '手机号码', pattern: '^1[3-9]\\d{9}$'},
    {name: 'URL', pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$'},
    {
      name: 'IP地址',
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    },
    {name: '日期', pattern: '^\\d{4}(-|\\/)?\\d{1,2}(-|\\/)?\\d{1,2}$'}
  ]

  const handlePatternChange = (value: string) => {
    setPattern(value)
    testRegex(value, flags, testString)
  }

  const handleFlagsChange = (value: string) => {
    setFlags(value)
    testRegex(pattern, value, testString)
  }

  const handleTestStringChange = (value: string) => {
    setTestString(value)
    testRegex(pattern, flags, value)
  }

  const testRegex = (pattern: string, flags: string, testString: string) => {
    if (!pattern || !testString) {
      setMatches([])
      return
    }

    try {
      const regex = new RegExp(pattern, flags)
      const matches = testString.match(regex) || []
      setMatches(matches)
    } catch (error) {
      console.error('Invalid regex:', error)
      setMatches([])
    }
  }

  return (
    <View className='regex-tester'>
      <View className='label'>正则表达式</View>
      <Input
        name='pattern'
        type='text'
        placeholder='输入正则表达式'
        value={pattern}
        onChange={handlePatternChange}
      />
      <View className='label'>标志</View>
      <Input
        name='flags'
        type='text'
        placeholder='g, i, m, s, u, y'
        value={flags}
        onChange={handleFlagsChange}
      />
      <TextArea
        value={testString}
        onChange={handleTestStringChange}
        maxLength={200}
        placeholder='输入测试文本'
      />
      <View className='matches'>
        <View className='title'>匹配结果：</View>
        {matches.map((match, index) => (
          <View key={index} className='match-item'>
            {match}
          </View>
        ))}
      </View>
      <View className='common-patterns'>
        <View className='title'>常用正则表达式：</View>
        <VirtualList
          itemHeight={50}
          list={commonPatterns}
          itemRender={(item, dataIndex, index) => <Cell title={item.name} extra={item.pattern}
                                                        onClick={() => handlePatternChange(item.pattern)}></Cell>}
        />
      </View>
    </View>
  )
}

export default RegexTester
