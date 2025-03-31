import {Button, Input, View} from '@tarojs/components'
import {useEffect, useState} from 'react'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import './index.less'

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
  const {language} = useAppSelector(state => state.app)
  const [loanAmount, setLoanAmount] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [calculationType, setCalculationType] = useState<'equal-payment' | 'equal-principal'>('equal-payment')
  const [result, setResult] = useState<LoanResult | null>(null)

  useEffect(() => {
    updatePageTitle(language, 'mortgageCalculator')
  }, [language])

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

  return (
    <View className='mortgage-calculator'>
      <View className='input-section'>
        <View className='input-group'>
          <View className='label'>贷款金额 (元)</View>
          <Input
            className='input'
            type='digit'
            value={loanAmount}
            onInput={e => setLoanAmount(e.detail.value)}
            placeholder='请输入贷款金额'
          />
        </View>

        <View className='input-group'>
          <View className='label'>贷款年限 (年)</View>
          <Input
            className='input'
            type='digit'
            value={loanTerm}
            onInput={e => setLoanTerm(e.detail.value)}
            placeholder='请输入贷款年限'
          />
        </View>

        <View className='input-group'>
          <View className='label'>年利率 (%)</View>
          <Input
            className='input'
            type='digit'
            value={interestRate}
            onInput={e => setInterestRate(e.detail.value)}
            placeholder='请输入年利率'
          />
        </View>

        <View className='calculation-type'>
          <Button
            className={`type-button ${calculationType === 'equal-payment' ? 'active' : ''}`}
            onClick={() => setCalculationType('equal-payment')}
          >
            等额本息
          </Button>
          <Button
            className={`type-button ${calculationType === 'equal-principal' ? 'active' : ''}`}
            onClick={() => setCalculationType('equal-principal')}
          >
            等额本金
          </Button>
        </View>

        <Button className='calculate-button' onClick={handleCalculate}>
          计算
        </Button>
      </View>

      {result && (
        <View className='result-section'>
          <View className='result-item'>
            <View className='label'>首月还款</View>
            <View className='value'>{formatCurrency(result.monthlyPayment)} 元</View>
          </View>
          <View className='result-item'>
            <View className='label'>总还款额</View>
            <View className='value'>{formatCurrency(result.totalPayment)} 元</View>
          </View>
          <View className='result-item'>
            <View className='label'>总利息</View>
            <View className='value'>{formatCurrency(result.totalInterest)} 元</View>
          </View>

          <View className='schedule-section'>
            <View className='schedule-header'>还款计划</View>
            <View className='schedule-list'>
              {result.paymentSchedule.map((item, index) => (
                <View key={index} className='schedule-item'>
                  <View className='month'>第 {item.month} 期</View>
                  <View className='details'>
                    <View>月供：{formatCurrency(item.totalPayment)} 元</View>
                    <View>本金：{formatCurrency(item.principal)} 元</View>
                    <View>利息：{formatCurrency(item.interest)} 元</View>
                    <View>剩余本金：{formatCurrency(item.remainingPrincipal)} 元</View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default MortgageCalculator
