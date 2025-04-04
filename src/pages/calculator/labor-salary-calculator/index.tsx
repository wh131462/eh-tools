import {useState} from 'react'
import {Text, View} from '@tarojs/components'
import {Button, Cell, ConfigProvider, Input, Progress, Tag} from '@nutui/nutui-react-taro'
import {useTranslation} from '@/i18n'
import './index.less'
import {usePageTitle} from "@/hooks/usePageTitle";
import {useAppSelector} from "@/store/hooks";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

// 工作时间相关常量
const STANDARD_WORK_HOURS = 8 // 标准工作时长
const STANDARD_WORK_DAYS = 21.75 // 月平均工作日
const OVERTIME_RATES = {
  workday: 1.5,  // 工作日加班
  weekend: 2.0,  // 休息日加班
  holiday: 3.0   // 法定节假日加班
}

const LaborSalaryCalculator = () => {
  const {t} = useTranslation()
  usePageTitle('laborSalaryCalculator')
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["laborSalaryCalculator"]
  });
  useShareTimeline(() => {
    return shares["laborSalaryCalculator"]
  });
  // 基础输入
  const [baseSalary, setBaseSalary] = useState('5000') // 基本工资
  const [workHours, setWorkHours] = useState('9') // 日工作时长
  const [weekendHours, setWeekendHours] = useState('0') // 周末加班时长
  const [holidayHours, setHolidayHours] = useState('0') // 节假日加班时长

  // 计算结果
  const [result, setResult] = useState({
    normalPay: 0, // 正常工资
    workdayOvertimePay: 0, // 工作日加班费
    weekendOvertimePay: 0, // 周末加班费
    holidayOvertimePay: 0, // 节假日加班费
    totalPay: 0, // 应得总工资
    isLegal: true, // 是否合法
    violations: [] as string[] // 违法情况
  })

  const calculate = () => {
    const baseHourlyRate = Number(baseSalary) / (STANDARD_WORK_HOURS * STANDARD_WORK_DAYS)
    const dailyWorkHours = Number(workHours)
    const monthlyWeekendHours = Number(weekendHours)
    const monthlyHolidayHours = Number(holidayHours)

    // 检查违法情况
    const violations: string[] = []
    if (dailyWorkHours > 12) {
      violations.push(t('dailyWorkTimeExceeded'))
    }
    if (dailyWorkHours - STANDARD_WORK_HOURS > 3) {
      violations.push(t('dailyOvertimeExceeded'))
    }
    const monthlyOvertimeHours = ((dailyWorkHours - STANDARD_WORK_HOURS) * STANDARD_WORK_DAYS) +
      monthlyWeekendHours + monthlyHolidayHours
    if (monthlyOvertimeHours > 36) {
      violations.push(t('monthlyOvertimeExceeded'))
    }

    // 计算正常工资
    const normalPay = Number(baseSalary)

    // 计算工作日加班费
    const workdayOvertimeHours = Math.max(0, dailyWorkHours - STANDARD_WORK_HOURS) * STANDARD_WORK_DAYS
    const workdayOvertimePay = workdayOvertimeHours * baseHourlyRate * OVERTIME_RATES.workday

    // 计算周末加班费
    const weekendOvertimePay = monthlyWeekendHours * baseHourlyRate * OVERTIME_RATES.weekend

    // 计算节假日加班费
    const holidayOvertimePay = monthlyHolidayHours * baseHourlyRate * OVERTIME_RATES.holiday

    // 计算总工资
    const totalPay = normalPay + workdayOvertimePay + weekendOvertimePay + holidayOvertimePay

    setResult({
      normalPay: Number(normalPay.toFixed(2)),
      workdayOvertimePay: Number(workdayOvertimePay.toFixed(2)),
      weekendOvertimePay: Number(weekendOvertimePay.toFixed(2)),
      holidayOvertimePay: Number(holidayOvertimePay.toFixed(2)),
      totalPay: Number(totalPay.toFixed(2)),
      isLegal: violations.length === 0,
      violations
    })
  }

  return (
    <ConfigProvider theme={{nutuiBrandColor: '#3768FA'}}>
      <View className="container">
        <View className="form-card">
          {/* 基础信息 */}
          <Cell title={t('baseSalary')} extra={<Input
            type="number"
            value={baseSalary}
            onChange={v => setBaseSalary(v)}
            className="worthy-input"
            align="right"
          />}/>

          {/* 工作时间 */}
          <Cell title={t('workHours')} extra={<Input
            type="digit"
            value={workHours}
            onChange={v => setWorkHours(v)}
            className="worthy-input"
            align="right"
          />}
                description={`${t('workdayOvertimePay')}: x1.5`}
          />

          <Cell title={t('weekendHours')} extra={<Input
            type="digit"
            value={weekendHours}
            onChange={v => setWeekendHours(v)}
            className="worthy-input"
            align="right"
          />}
                description={`${t('weekendOvertimePay')}: x2.0`}
          />

          <Cell title={t('holidayHours')} extra={<Input
            type="digit"
            value={holidayHours}
            onChange={v => setHolidayHours(v)}
            className="worthy-input"
            align="right"
          />}
                description={`${t('holidayOvertimePay')}: x3.0`}
          />

          <Button
            type="primary"
            block
            onClick={calculate}
            className="worthy-button"
            size="large"
          >
            {t('calculateSalary')}
          </Button>
        </View>

        {/* 结果展示 */}
        {result.totalPay > 0 && (
          <View className="result-card">
            <Text className="score">{result.totalPay}</Text>
            <Progress
              percent={100}
              color={result.isLegal ? '#00b578' : '#fa2c2c'}
              strokeWidth="4"
            />

            <View className="factor-grid">
              <Tag type="primary">{t('normalPay')}: {result.normalPay}</Tag>
              <Tag type="success">{t('workdayOvertimePay')}: {result.workdayOvertimePay}</Tag>
              <Tag type="warning">{t('weekendOvertimePay')}: {result.weekendOvertimePay}</Tag>
              <Tag type="danger">{t('holidayOvertimePay')}: {result.holidayOvertimePay}</Tag>
            </View>

            {!result.isLegal && (
              <View className="violations">
                <Text className="violation-title">{t('violations')}：</Text>
                {result.violations.map((violation, index) => (
                  <Text key={index} className="violation-item">• {violation}</Text>
                ))}
              </View>
            )}

            <Text className="evaluation">
              {result.isLegal ? t('legalStatus') : t('illegalStatus')}
            </Text>
          </View>
        )}
      </View>
    </ConfigProvider>
  )
}

export default LaborSalaryCalculator
