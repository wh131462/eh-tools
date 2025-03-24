import {EarthBranch, LunarDay, LunarYear, SolarDay} from "tyme4ts";

interface LunarDate {
  year: number;
  month: number;
  day: number;
}

interface SolarDate {
  year: number;
  month: number;
  day: number;
}

interface AlmanacInfo {
  suitable: string[];
  avoid: string[];
  taishen: string;
  direction: string;
}

class LunarCalendar {
  public static solarToLunar(solar: SolarDate): LunarDate {
    const solarDate = SolarDay.fromYmd(solar.year, solar.month, solar.day);
    const lunarDate = solarDate.getLunarDay();
    return {
      year: lunarDate.getYear(),
      month: lunarDate.getMonth(),
      day: lunarDate.getDay(),
    };
  }

  public static lunarToSolar(lunar: LunarDate): SolarDate {
    const lunarDate = LunarDay.fromYmd(lunar.year, lunar.month, lunar.day);
    const solarDate = lunarDate.getSolarDay();
    return {
      year: solarDate.getYear(),
      month: solarDate.getMonth(),
      day: solarDate.getDay()
    };
  }

  public static getAnimalYear(year: number): string {
    const name = LunarYear.fromYear(year).getSixtyCycle()
    return EarthBranch.fromName(name.getName()).getZodiac().toString()
  }

  public static getGanZhiYear(year: number): string {
    return LunarYear.fromYear(year).getSixtyCycle().toString()
  }

  public static getSolarTerm(month: number, day: number): string | null {
    const solar = SolarDay.fromYmd(new Date().getFullYear(), month, day);
    const jieQi = solar.getTerm().toString()
    return jieQi ? jieQi : null;
  }

  public static getAlmanacInfo(year: number, month: number, day: number): AlmanacInfo {
    const lunar = LunarDay.fromYmd(year, month, day);
    return {
      suitable: lunar.getRecommends().map(o => o.toString()),
      avoid: lunar.getAvoids().map(o => o.toString()),
      taishen: lunar.getFetusDay().toString(),
      direction: lunar.getJupiterDirection().toString()
    };
  }
}

export default LunarCalendar;
