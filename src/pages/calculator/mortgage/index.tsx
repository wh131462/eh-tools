import {Button, Input, View} from '@tarojs/components'
import {useState} from 'react'
import './index.less'
import {useTranslation} from "@/i18n";
import {VirtualList} from "@nutui/nutui-react-taro";
import {usePageTitle} from "@/hooks/usePageTitle";

interface LoanResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  paymentSchedule: Array<{
    month: number
    principal: number
    interest: number
    totalPayment: number
    remainingPrincipal: number
  }>
}

function MortgageCalculator() {
  const {t} = useTranslation()
  const [loanAmount, setLoanAmount] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [calculationType, setCalculationType] = useState<'equal-payment' | 'equal-principal'>('equal-payment')
  const [result, setResult] = useState<LoanResult | null>(null)
  usePageTitle("mortgage")

  const calculateEqualPayment = () => {
    const principal = parseFloat(loanAmount)
    const years = parseFloat(loanTerm)
    const rate = parseFloat(interestRate) / 100 / 12
    const months = years * 12

    if (isNaN(principal) || isNaN(years) || isNaN(rate)) {
      return null
    }

    const monthlyPayment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    const totalPayment = monthlyPayment * months
    const totalInterest = totalPayment - principal

    const schedule: any[] = []
    let remainingPrincipal = principal

    for (let month = 1; month <= months; month++) {
      const interest = remainingPrincipal * rate
      const principalPaid = monthlyPayment - interest
      remainingPrincipal -= principalPaid

      schedule.push({
        month,
        principal: principalPaid,
        interest,
        totalPayment: monthlyPayment,
        remainingPrincipal: Math.max(0, remainingPrincipal)
      })
    }

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      paymentSchedule: schedule
    }
  }

  const calculateEqualPrincipal = () => {
    const principal = parseFloat(loanAmount)
    const years = parseFloat(loanTerm)
    const rate = parseFloat(interestRate) / 100 / 12
    const months = years * 12

    if (isNaN(principal) || isNaN(years) || isNaN(rate)) {
      return null
    }

    const monthlyPrincipal = principal / months
    const schedule: any[] = []
    let remainingPrincipal = principal
    let totalPayment = 0

    for (let month = 1; month <= months; month++) {
      const interest = remainingPrincipal * rate
      const payment = monthlyPrincipal + interest
      remainingPrincipal -= monthlyPrincipal
      totalPayment += payment

      schedule.push({
        month,
        principal: monthlyPrincipal,
        interest,
        totalPayment: payment,
        remainingPrincipal: Math.max(0, remainingPrincipal)
      })
    }

    return {
      monthlyPayment: schedule[0].totalPayment,
      totalPayment,
      totalInterest: totalPayment - principal,
      paymentSchedule: schedule
    }
  }

  const handleCalculate = () => {
    const result = calculationType === 'equal-payment'
      ? calculateEqualPayment()
      : calculateEqualPrincipal()
    setResult(result)
  }

  const formatCurrency = (value: number) => {
    return value.toFixed(2)
  }
  const [expanded, setExpanded] = useState(false);
  return (
    <View className='mortgage-calculator'>
      <View className='input-section'>
        <View className='input-group'>
          <View className='label'>{t('loanAmount')} ({t('loanAmountUnit')})</View>
          <Input
            className='input'
            type='digit'
            value={loanAmount}
            onInput={e => setLoanAmount(e.detail.value)}
            placeholder={t('pleaseInput') + t('loanAmount')}
          />
        </View>

        <View className='input-group'>
          <View className='label'>{t('loanTerm')} ({t('loanTermUnit')})</View>
          <Input
            className='input'
            type='digit'
            value={loanTerm}
            onInput={e => setLoanTerm(e.detail.value)}
            placeholder={t('pleaseInput') + t('loanTerm')}
          />
        </View>

        <View className='input-group'>
          <View className='label'>{t('interestRate')} ({t('interestRateUnit')})</View>
          <Input
            className='input'
            type='digit'
            value={interestRate}
            onInput={e => setInterestRate(e.detail.value)}
            placeholder={t('pleaseInput') + t('interestRate')}
          />
        </View>

        <View className='calculation-type'>
          <Button
            className={`type-button ${calculationType === 'equal-payment' ? 'active' : ''}`}
            onClick={() => setCalculationType('equal-payment')}
          >
            {t('equalPayment')}
          </Button>
          <Button
            className={`type-button ${calculationType === 'equal-principal' ? 'active' : ''}`}
            onClick={() => setCalculationType('equal-principal')}
          >
            {t('equalPrincipal')}
          </Button>
        </View>

        <Button className='calculate-button' onClick={handleCalculate}>
          {t('calculate')}
        </Button>
      </View>

      {result && (
        <View className='result-section'>
          <View className='result-item'>
            <View className='label'>{t('monthlyPayment')}</View>
            <View className='value'>{formatCurrency(result.monthlyPayment)} {t('loanAmountUnit')}</View>
          </View>
          <View className='result-item'>
            <View className='label'>{t('totalPayment')}</View>
            <View className='value'>{formatCurrency(result.totalPayment)} {t('loanAmountUnit')}</View>
          </View>
          <View className='result-item'>
            <View className='label'>{t('totalInterest')}</View>
            <View className='value'>{formatCurrency(result.totalInterest)} {t('loanAmountUnit')}</View>
          </View>
          <View className='schedule-section'>
            <View className='schedule-header'>{t('paymentSchedule')}</View>
            <View className='schedule-list'>
              {expanded ? (
                <VirtualList containerHeight={400}
                             itemHeight={100}
                             itemEqual={true} list={result.paymentSchedule}
                             itemRender={(item, index) => (
                               <View key={index} className='compact-item'>
                                 <View className='header'>
                                   <View className='month'>第{item.month}期</View>
                                   <View className='total'>{formatCurrency(item.totalPayment)}</View>
                                 </View>
                                 <View className='detail-row'>
                                   <View>本金 {formatCurrency(item.principal)}</View>
                                   <View>利息 {formatCurrency(item.interest)}</View>
                                 </View>
                                 <View className='remaining'>
                                   剩余 {formatCurrency(item.remainingPrincipal)}
                                 </View>
                               </View>
                             )}></VirtualList>
              ) : (
                <View className='summary-stats'>
                  <View>首月还款：{formatCurrency(result.paymentSchedule[0].totalPayment)}</View>
                  <View>末月还款：{formatCurrency(result.paymentSchedule.slice(-1)[0].totalPayment)}</View>
                </View>
              )}
              <Button onClick={() => setExpanded(!expanded)}>
                {expanded ? '收起明细' : '展开全部'}
              </Button>

            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default MortgageCalculator
