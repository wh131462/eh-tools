import {EarthBranch, LunarDay, LunarHour, LunarYear, SolarDay} from 'tyme4ts';

/**
 * 农历工具类
 * 封装公历与农历转换、节气查询、节假日判断等功能
 */
class LunarUtils {
  // 获取农历日
  public static getLunarDay(date: Date): LunarHour {
    const lunarDay = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunarDay();
    return LunarHour.fromYmdHms(lunarDay.getYear(), lunarDay.getMonth(), lunarDay.getDay(), 0, 0, 0);
  }

  public static getSolarDay(date: Date) {
    return SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  public static getFestival(date: Date): string {
    return LunarUtils.getSolarDay(date).getFestival()?.getName() ?? ""
  }

  // 获取日期 正月初一
  public static getLunarDate(date: Date): string {
    const lunarDay = LunarUtils.getLunarDay(date);
    const month = lunarDay.getLunarDay().getLunarMonth().getName();
    const day = lunarDay.getLunarDay().getName()
    return `${month}${day}`
  }

  // 获取简短 如 正月 初一
  public static getShortLunarDate(date: Date): string {
    const lunarDay = LunarUtils.getLunarDay(date);
    const month = lunarDay.getLunarDay().getLunarMonth().getName();
    const day = lunarDay.getLunarDay().getName()
    return lunarDay.getLunarDay().getDay() == 1 ? month : day
  }

  /**
   * 公历转农历（支持Date对象或年月日）
   * @param date 日期对象或年月日参数
   * @returns 农历信息对象
   */
  static solarToLunar(date: Date | number[]): LunarInfo {
    let solar: SolarDay;

    if (date instanceof Date) {
      solar = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    } else if (Array.isArray(date)) {
      solar = SolarDay.fromYmd(date[0], date[1], date[2]);
    } else {
      throw new Error('Invalid date parameter');
    }

    const lunar = solar.getLunarDay();
    return this.formatLunarData(lunar);
  }

  /**
   * 获取今日农历信息
   * @returns 当前农历信息
   */
  static getTodayLunar(): LunarInfo {
    return this.solarToLunar(new Date());
  }

  /**
   * 检查指定日期是否为节气
   * @param date 日期对象
   * @returns 节气名称或空字符串
   */
  static getSolarTerm(date: Date): string {
    const solar = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return solar.getTerm()?.getName() || '';
  }

  /**
   * 获取生肖年信息
   * @param year 年份（公历或农历年）
   * @param isLunarYear 是否为农历年
   * @returns 生肖名称
   */
  static getZodiac(year: number, isLunarYear = true): string {
    const baseYear = isLunarYear ? year : SolarDay.fromYmd(year, 1, 1).getLunarDay().getYear();
    return LunarYear.fromYear(baseYear).getTwenty().getName();
  }

  // 格式化农历数据
  private static formatLunarData(lunar: LunarDay): LunarInfo {
    const solar = lunar.getSolarDay();
    const lunarMonth = lunar.getLunarMonth();
    const lunarYear = lunarMonth.getLunarYear();
    const nineStar = lunar.getNineStar();
    const twentyEightStar = lunar.getTwentyEightStar();
    const duty = lunar.getDuty();
    const pengZu = lunar.getSixtyCycle().getPengZu();

    return {
      // 基础信息
      lunarDate: lunar.toString(), // 例："农历癸卯年正月廿三"
      year: lunarYear.getYear(),
      month: lunarMonth.getMonth(),
      day: lunar.getDay(),
      isLeap: lunarMonth.isLeap(),

      // 生肖干支
      zodiac: EarthBranch.fromName(lunar.getYearSixtyCycle()?.getName()?.at(-1) ?? "").getZodiac().toString(), // 通过农历年获取生肖
      ganZhiYear: lunar.getYearSixtyCycle().toString(), // 年干支
      ganZhiMonth: lunar.getMonthSixtyCycle().toString(), // 月干支
      ganZhiDay: lunar.getSixtyCycle().toString(), // 日干支

      // 节气节日
      solarTerm: solar.getTerm()?.getName() || '', // 当前节气
      solarFestival: solar.getFestival()?.getName(),
      lunarFestival: lunar.getFestival()?.getName(),
      // 传统历法要素
      chineseDate: this.getShortLunarDate(new Date(lunar.getYear(), lunar.getMonth(), lunar.getDay())), // 自定义获取中文日期
      sanHou: solar.getPhenologyDay()?.getPhenology().getThreePhenology().getName() || '', // 三候

      // 神煞方位
      rokuyou: lunar.getSixStar()?.getName() || '', // 六曜
      jiuXing: nineStar?.getName() || '', // 九星
      twentyEightStar: twentyEightStar?.getName() || '', // 二十八宿
      taishen: lunar.getFetusDay()?.getName() || '',

      // 彭祖忌宜
      pengzu: [
        pengZu?.getPengZuHeavenStem().getName(),
        pengZu?.getPengZuEarthBranch().getName()
      ].filter(Boolean).join('，') || '',

      // 建除宜忌
      jianchu: duty?.getName() || '', // 建除十二神
      hourLuck: this.getHourLuck(lunar), // 自定义时辰吉凶
      direction: lunar.getJupiterDirection()?.getName() || '', // 冲煞方位

      // 黄历宜忌
      suitable: lunar.getRecommends().toString(), // 宜事项
      avoid: lunar.getAvoids().toString(), // 忌事项
      // 吉凶神
      luckyGods: lunar.getGods().filter(o => o.getLuck().getName() === '吉').map(g => g.getName()),
      unluckyGods: lunar.getGods().filter(o => o.getLuck().getName() === '凶').map(g => g.getName())
    };
  }


// 辅助方法：生成时辰吉凶
  private static getHourLuck(lunar: LunarDay): Record<string, string> {
    return lunar.getHours().reduce((acc, hour) => {
      acc[hour.getSixtyCycle().getName()] = hour.getMinorRen().getLuck().getName()
      return acc;
    }, {});
  }

}

/**
 * 农历信息结构体
 */
export interface LunarInfo {
  lunarDate: string;
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  zodiac: string;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  solarTerm: string;
  solarFestival?: string;
  lunarFestival?: string;
  chineseDate: string;
  sanHou: string;
  rokuyou: string;
  jiuXing: string;
  twentyEightStar: string;
  taishen: string;
  pengzu: string;
  jianchu: string;
  hourLuck: Record<string, string>;
  direction: string;
  suitable: string;
  avoid: string;
  luckyGods: string[];
  unluckyGods: string[];
}

export default LunarUtils;
