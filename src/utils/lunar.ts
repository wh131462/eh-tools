import {EarthBranch, LunarHour, LunarYear, SolarDay} from "tyme4ts";

interface AlmanacInfo {
  suitable: string[];
  avoid: string[];
  taishen: string;
  direction: string;
}

class LunarUtil {
  // 获取农历日
  public static getLunarDay(date: Date): LunarHour {
    const lunarDay = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunarDay();
    return LunarHour.fromYmdHms(lunarDay.getYear(), lunarDay.getMonth(), lunarDay.getDay(), 0, 0, 0);
  }

  public static getSolarDay(date: Date) {
    return SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  public static getFestival(date: Date): string {
    return LunarUtil.getSolarDay(date).getFestival()?.getName() ?? ""
  }

  // 获取日期 正月初一
  public static getLunarDate(date: Date): string {
    const lunarDay = LunarUtil.getLunarDay(date);
    const month = lunarDay.getLunarDay().getLunarMonth().getName();
    const day = lunarDay.getLunarDay().getName()
    return `${month}${day}`
  }

  // 获取简短 如 正月 初一
  public static getShortLunarDate(date: Date): string {
    const lunarDay = LunarUtil.getLunarDay(date);
    const month = lunarDay.getLunarDay().getLunarMonth().getName();
    const day = lunarDay.getLunarDay().getName()
    return lunarDay.getLunarDay().getDay() == 1 ? month : day
  }

  public static getAnimalYear(year: number): string {
    const name = LunarYear.fromYear(year).getSixtyCycle().toString()[1];
    return EarthBranch.fromName(name).getZodiac().toString()
  }

  public static getGanZhiYear(year: number): string {
    return LunarYear.fromYear(year).getSixtyCycle().toString()
  }

  public static getSolarTerm(date: Date): string | null {
    const solar = SolarDay.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const jieQi = solar.getTerm().toString()
    return jieQi ? jieQi : null;
  }

  public static getAlmanacInfo(date: Date): AlmanacInfo {
    const lunar = LunarUtil.getLunarDay(date);
    return {
      suitable: lunar.getRecommends().map(o => o.toString()),
      avoid: lunar.getAvoids().map(o => o.toString()),
      taishen: lunar.getLunarDay().getFetusDay().toString(),
      direction: lunar.getLunarDay().getJupiterDirection().toString()
    };
  }
}

export default LunarUtil;
