<template>
  <view class="page license-plate-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <!-- 导航栏 -->
    <nav-bar :title="t('licensePlate.title')" />

    <!-- 输入卡片 -->
    <view class="main-card">
      <view class="card-title">{{ t('licensePlate.subtitle') }}</view>

      <view class="input-section">
        <view class="input-wrapper">
          <input
            v-model="plateNumber"
            class="plate-input"
            type="text"
            :placeholder="t('licensePlate.inputPlaceholder')"
            maxlength="8"
            @confirm="handleQuery"
          />
          <view v-if="plateNumber" class="clear-btn" @click="clearInput">
            <text class="clear-icon">×</text>
          </view>
        </view>

        <view class="query-btn" @click="handleQuery">
          <text class="query-btn-text">{{ t('licensePlate.query') }}</text>
        </view>
      </view>

      <!-- 快捷省份选择 -->
      <view class="province-shortcuts">
        <view
          v-for="province in commonProvinces"
          :key="province"
          class="province-tag"
          @click="insertProvince(province)"
        >
          {{ province }}
        </view>
      </view>
    </view>

    <!-- 结果展示 -->
    <view v-if="queryResult" class="result-card">
      <view class="card-title">{{ t('licensePlate.result') }}</view>

      <view class="result-content">
        <view class="plate-preview" :class="plateTypeClass">
          <text class="plate-preview-text">{{ queryResult.plateNumber }}</text>
        </view>

        <!-- 特殊车牌展示 -->
        <view v-if="queryResult.isSpecial" class="result-items">
          <view class="result-item">
            <text class="result-label">{{ t('licensePlate.plateType') }}</text>
            <text class="result-value">{{ queryResult.plateTypeText }}</text>
          </view>
          <view
            v-for="(info, idx) in queryResult.specialInfoList"
            :key="idx"
            class="result-item"
          >
            <text class="result-label">{{ info.label }}</text>
            <text class="result-value">{{ info.value }}</text>
          </view>
        </view>

        <!-- 普通车牌展示 -->
        <view v-else class="result-items">
          <view class="result-item">
            <text class="result-label">{{ t('licensePlate.province') }}</text>
            <text class="result-value">{{ queryResult.province }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">{{ t('licensePlate.city') }}</text>
            <text class="result-value">{{ queryResult.city }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">{{ t('licensePlate.plateType') }}</text>
            <text class="result-value">{{ queryResult.plateTypeText }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 查询历史 -->
    <view v-if="queryHistory.length > 0" class="history-card">
      <view class="card-header">
        <text class="card-title">{{ t('licensePlate.recentHistory') }}</text>
        <text class="clear-history" @click="handleClearHistory">{{ t('licensePlate.clearHistory') }}</text>
      </view>

      <view class="history-list">
        <view
          v-for="(item, index) in queryHistory"
          :key="index"
          class="history-item"
          @click="queryFromHistory(item.plateNumber)"
        >
          <view class="history-plate" :class="getPlateTypeClass(item.plateType)">
            {{ item.plateNumber }}
          </view>
          <view class="history-info">
            <text class="history-location">{{ item.province || item.plateType }}{{ item.city ? ` · ${item.city}` : '' }}</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="licensePlateShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'
import { showToast } from '@/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 车牌号输入
const plateNumber = ref('')

// 查询结果
interface SpecialInfo {
  label: string
  value: string
}

interface QueryResult {
  plateNumber: string
  province: string
  city: string
  plateType: 'normal' | 'newEnergy' | 'police' | 'army' | 'embassy' | 'hongkongMacao'
  plateTypeText: string
  isSpecial?: boolean
  specialInfoList?: SpecialInfo[]
}

const queryResult = ref<QueryResult | null>(null)

// 查询历史
interface HistoryItem {
  plateNumber: string
  province: string
  city: string
  plateType: string
  timestamp: number
}

const queryHistory = ref<HistoryItem[]>([])

// 工具分享图配置
const toolShareConfig = {
  toolName: t('licensePlate.title'),
  category: 'life' as const,
  subtitle: t('licensePlate.subtitle')
}

// 分享图 URL
const toolShareImageUrl = ref('')

function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 常用省份快捷键
const commonProvinces = ['京', '沪', '粤', '苏', '浙', '鲁', '川', '豫', '冀', '湘', '鄂', '皖']

// 车牌数据库
const PROVINCE_DATA: Record<string, { name: string; cities: Record<string, string> }> = {
  '京': {
    name: '北京市',
    cities: {
      'A': '北京市区', 'B': '北京市区', 'C': '北京市区', 'D': '北京市区',
      'E': '北京市区', 'F': '北京市区', 'G': '北京市区', 'H': '北京市区',
      'J': '北京市区', 'K': '北京市区', 'L': '北京市区', 'M': '北京市区',
      'N': '北京市区', 'P': '北京市区', 'Q': '北京市区', 'Y': '郊区'
    }
  },
  '沪': {
    name: '上海市',
    cities: {
      'A': '上海市区', 'B': '上海市区', 'C': '远郊区域(松江/青浦/奉贤/金山等)', 'D': '上海市区',
      'E': '上海市区', 'F': '上海市区', 'G': '上海市区', 'H': '上海市区',
      'J': '上海市区', 'K': '上海市区', 'L': '上海市区', 'M': '上海市区',
      'N': '上海市区', 'R': '崇明/长兴/横沙三岛'
    }
  },
  '津': {
    name: '天津市',
    cities: {
      'A': '天津市区', 'B': '天津市区', 'C': '天津市区', 'D': '天津市区',
      'E': '天津市区', 'F': '天津市区', 'G': '天津市区', 'H': '天津市区',
      'J': '天津市区', 'K': '天津市区', 'L': '天津市区', 'M': '天津市区',
      'N': '天津市区', 'Q': '天津市区', 'R': '天津市区'
    }
  },
  '渝': {
    name: '重庆市',
    cities: {
      'A': '渝中区/江北区/九龙坡区/大渡口区', 'B': '南岸区/沙坪坝区/北碚区/渝北区/巴南区等',
      'C': '永川区/江津区/合川区/潼南区/铜梁区/璧山区/大足区',
      'D': '主城增补', 'F': '万州区/梁平区/巫山县/奉节县/云阳县等',
      'G': '涪陵区/南川区/垫江县/丰都县/武隆区', 'H': '黔江区/石柱县/秀山县/酉阳县/彭水县',
      'N': '市级机关'
    }
  },
  '冀': {
    name: '河北省',
    cities: {
      'A': '石家庄市', 'B': '唐山市', 'C': '秦皇岛市', 'D': '邯郸市',
      'E': '邢台市', 'F': '保定市', 'G': '张家口市', 'H': '承德市',
      'J': '沧州市', 'R': '廊坊市', 'T': '衡水市'
    }
  },
  '豫': {
    name: '河南省',
    cities: {
      'A': '郑州市', 'B': '开封市', 'C': '洛阳市', 'D': '平顶山市',
      'E': '安阳市', 'F': '鹤壁市', 'G': '新乡市', 'H': '焦作市',
      'J': '濮阳市', 'K': '许昌市', 'L': '漯河市', 'M': '三门峡市',
      'N': '商丘市', 'P': '周口市', 'Q': '驻马店市', 'R': '南阳市',
      'S': '信阳市', 'U': '济源市', 'V': '郑州市增补'
    }
  },
  '云': {
    name: '云南省',
    cities: {
      'A': '昆明市', 'C': '昭通市', 'D': '曲靖市',
      'E': '楚雄州', 'F': '玉溪市', 'G': '红河州', 'H': '文山州',
      'J': '普洱市', 'K': '西双版纳州', 'L': '大理州', 'M': '保山市',
      'N': '德宏州', 'P': '丽江市', 'Q': '怒江州', 'R': '迪庆州',
      'S': '临沧市'
    }
  },
  '辽': {
    name: '辽宁省',
    cities: {
      'A': '沈阳市', 'B': '大连市', 'C': '鞍山市', 'D': '抚顺市',
      'E': '本溪市', 'F': '丹东市', 'G': '锦州市', 'H': '营口市',
      'J': '阜新市', 'K': '辽阳市', 'L': '盘锦市', 'M': '铁岭市',
      'N': '朝阳市', 'P': '葫芦岛市'
    }
  },
  '黑': {
    name: '黑龙江省',
    cities: {
      'A': '哈尔滨市', 'B': '齐齐哈尔市', 'C': '牡丹江市', 'D': '佳木斯市',
      'E': '大庆市', 'F': '伊春市', 'G': '鸡西市', 'H': '鹤岗市',
      'J': '双鸭山市', 'K': '七台河市', 'L': '松花江地区(现属哈尔滨)',
      'M': '绥化市', 'N': '黑河市', 'P': '大兴安岭地区', 'R': '农垦系统'
    }
  },
  '湘': {
    name: '湖南省',
    cities: {
      'A': '长沙市', 'B': '株洲市', 'C': '湘潭市', 'D': '衡阳市',
      'E': '邵阳市', 'F': '岳阳市', 'G': '张家界市', 'H': '益阳市',
      'J': '常德市', 'K': '娄底市', 'L': '郴州市', 'M': '永州市',
      'N': '怀化市', 'U': '湘西州'
    }
  },
  '皖': {
    name: '安徽省',
    cities: {
      'A': '合肥市', 'B': '芜湖市', 'C': '蚌埠市', 'D': '淮南市',
      'E': '马鞍山市', 'F': '淮北市', 'G': '铜陵市', 'H': '安庆市',
      'J': '黄山市', 'K': '阜阳市', 'L': '宿州市', 'M': '滁州市',
      'N': '六安市', 'P': '宣城市', 'Q': '巢湖市', 'R': '池州市',
      'S': '亳州市'
    }
  },
  '鲁': {
    name: '山东省',
    cities: {
      'A': '济南市', 'B': '青岛市', 'C': '淄博市', 'D': '枣庄市',
      'E': '东营市', 'F': '烟台市', 'G': '潍坊市', 'H': '济宁市',
      'J': '泰安市', 'K': '威海市', 'L': '日照市', 'M': '滨州市',
      'N': '德州市', 'P': '聊城市', 'Q': '临沂市', 'R': '菏泽市',
      'S': '济南市增补(原莱芜)', 'U': '青岛市增补', 'V': '潍坊市增补',
      'W': '临沂市增补', 'Y': '烟台市增补'
    }
  },
  '新': {
    name: '新疆维吾尔自治区',
    cities: {
      'A': '乌鲁木齐市', 'B': '昌吉州', 'C': '石河子市', 'D': '奎屯市',
      'E': '博尔塔拉州', 'F': '伊犁州', 'G': '塔城地区', 'H': '阿勒泰地区',
      'J': '克拉玛依市', 'K': '吐鲁番地区', 'L': '哈密地区', 'M': '巴音郭楞州',
      'N': '阿克苏地区', 'P': '克孜勒苏州', 'Q': '喀什地区', 'R': '和田地区'
    }
  },
  '苏': {
    name: '江苏省',
    cities: {
      'A': '南京市', 'B': '无锡市', 'C': '徐州市', 'D': '常州市',
      'E': '苏州市', 'F': '南通市', 'G': '连云港市', 'H': '淮安市',
      'J': '盐城市', 'K': '扬州市', 'L': '镇江市', 'M': '泰州市',
      'N': '宿迁市'
    }
  },
  '浙': {
    name: '浙江省',
    cities: {
      'A': '杭州市', 'B': '宁波市', 'C': '温州市', 'D': '绍兴市',
      'E': '湖州市', 'F': '嘉兴市', 'G': '金华市', 'H': '衢州市',
      'J': '台州市', 'K': '丽水市', 'L': '舟山市', 'M': '杭州市增补'
    }
  },
  '赣': {
    name: '江西省',
    cities: {
      'A': '南昌市', 'B': '赣州市', 'C': '宜春市', 'D': '吉安市',
      'E': '上饶市', 'F': '抚州市', 'G': '九江市', 'H': '景德镇市',
      'J': '萍乡市', 'K': '新余市', 'L': '鹰潭市', 'M': '南昌市增补/省直系统'
    }
  },
  '鄂': {
    name: '湖北省',
    cities: {
      'A': '武汉市', 'B': '黄石市', 'C': '十堰市', 'D': '荆州市',
      'E': '宜昌市', 'F': '襄阳市', 'G': '鄂州市', 'H': '荆门市',
      'J': '黄冈市', 'K': '孝感市', 'L': '咸宁市', 'M': '仙桃市',
      'N': '潜江市', 'P': '神农架林区', 'Q': '恩施州', 'R': '天门市',
      'S': '随州市'
    }
  },
  '桂': {
    name: '广西壮族自治区',
    cities: {
      'A': '南宁市', 'B': '柳州市', 'C': '桂林市', 'D': '梧州市',
      'E': '北海市', 'F': '崇左市', 'G': '来宾市', 'H': '桂林市增补',
      'J': '贺州市', 'K': '玉林市', 'L': '百色市', 'M': '河池市',
      'N': '钦州市', 'P': '防城港市', 'R': '贵港市'
    }
  },
  '甘': {
    name: '甘肃省',
    cities: {
      'A': '兰州市', 'B': '嘉峪关市', 'C': '金昌市', 'D': '白银市',
      'E': '天水市', 'F': '酒泉市', 'G': '张掖市', 'H': '武威市',
      'J': '定西市', 'K': '陇南市', 'L': '平凉市', 'M': '庆阳市',
      'N': '临夏州', 'P': '甘南州'
    }
  },
  '晋': {
    name: '山西省',
    cities: {
      'A': '太原市', 'B': '大同市', 'C': '阳泉市', 'D': '长治市',
      'E': '晋城市', 'F': '朔州市', 'H': '忻州市', 'J': '吕梁市',
      'K': '晋中市', 'L': '临汾市', 'M': '运城市'
    }
  },
  '蒙': {
    name: '内蒙古自治区',
    cities: {
      'A': '呼和浩特市', 'B': '包头市', 'C': '乌海市', 'D': '赤峰市',
      'E': '呼伦贝尔市', 'F': '兴安盟', 'G': '通辽市', 'H': '锡林郭勒盟',
      'J': '乌兰察布市', 'K': '鄂尔多斯市', 'L': '巴彦淖尔市', 'M': '阿拉善盟'
    }
  },
  '陕': {
    name: '陕西省',
    cities: {
      'A': '西安市', 'B': '铜川市', 'C': '宝鸡市', 'D': '咸阳市',
      'E': '渭南市', 'F': '汉中市', 'G': '安康市', 'H': '商洛市',
      'J': '延安市', 'K': '榆林市', 'U': '西安市增补', 'V': '杨凌区'
    }
  },
  '吉': {
    name: '吉林省',
    cities: {
      'A': '长春市', 'B': '吉林市', 'C': '四平市', 'D': '辽源市',
      'E': '通化市', 'F': '白山市', 'G': '白城市', 'H': '延边州',
      'J': '松原市'
    }
  },
  '闽': {
    name: '福建省',
    cities: {
      'A': '福州市', 'B': '莆田市', 'C': '泉州市', 'D': '厦门市',
      'E': '漳州市', 'F': '龙岩市', 'G': '三明市', 'H': '南平市',
      'J': '宁德市', 'K': '省直机关'
    }
  },
  '贵': {
    name: '贵州省',
    cities: {
      'A': '贵阳市', 'B': '六盘水市', 'C': '遵义市', 'D': '铜仁市',
      'E': '黔西南州', 'F': '毕节市', 'G': '安顺市', 'H': '黔东南州',
      'J': '黔南州'
    }
  },
  '粤': {
    name: '广东省',
    cities: {
      'A': '广州市', 'B': '深圳市', 'C': '珠海市', 'D': '汕头市',
      'E': '佛山市', 'F': '韶关市', 'G': '湛江市', 'H': '肇庆市',
      'J': '江门市', 'K': '茂名市', 'L': '惠州市', 'M': '梅州市',
      'N': '汕尾市', 'P': '河源市', 'Q': '阳江市', 'R': '清远市',
      'S': '东莞市', 'T': '中山市', 'U': '潮州市', 'V': '揭阳市',
      'W': '云浮市', 'X': '顺德区', 'Y': '南海区', 'Z': '港澳进入内地'
    }
  },
  '青': {
    name: '青海省',
    cities: {
      'A': '西宁市', 'B': '海东市', 'C': '海北州', 'D': '黄南州',
      'E': '海南州', 'F': '果洛州', 'G': '玉树州', 'H': '海西州'
    }
  },
  '藏': {
    name: '西藏自治区',
    cities: {
      'A': '拉萨市', 'B': '昌都市', 'C': '山南市', 'D': '日喀则市',
      'E': '那曲市', 'F': '阿里地区', 'G': '林芝市'
    }
  },
  '川': {
    name: '四川省',
    cities: {
      'A': '成都市', 'B': '绵阳市', 'C': '自贡市', 'D': '攀枝花市',
      'E': '泸州市', 'F': '德阳市', 'G': '成都市增补', 'H': '广元市',
      'J': '遂宁市', 'K': '内江市', 'L': '乐山市', 'M': '资阳市',
      'Q': '宜宾市', 'R': '南充市', 'S': '达州市', 'T': '雅安市',
      'U': '阿坝州', 'V': '甘孜州', 'W': '凉山州',
      'X': '广安市', 'Y': '巴中市', 'Z': '眉山市'
    }
  },
  '宁': {
    name: '宁夏回族自治区',
    cities: {
      'A': '银川市', 'B': '石嘴山市', 'C': '吴忠市', 'D': '固原市',
      'E': '中卫市'
    }
  },
  '琼': {
    name: '海南省',
    cities: {
      'A': '海口市', 'B': '三亚市', 'C': '琼北地区(琼海/文昌/三沙/万宁等)',
      'D': '琼南地区(五指山/东方/白沙/昌江等)', 'E': '洋浦经济开发区', 'F': '儋州市'
    }
  }
}

// 特殊车牌前缀
const SPECIAL_PREFIXES: Record<string, { name: string; type: QueryResult['plateType'] }> = {
  'WJ': { name: '武警', type: 'police' },
  '警': { name: '公安警车', type: 'police' }
}

// 军牌前缀（含2012式新军牌和旧式军牌）
const ARMY_PREFIXES = [
  '军',
  // 2012式军牌
  'VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH', 'VJ', 'VK', 'VL', 'VM', 'VN', 'VO', 'VP', 'VQ', 'VR',
  'KA', 'KB', 'KC', 'KD', 'KE', 'KF', 'KG', 'KH', 'KJ', 'KK', 'KL', 'KM', 'KN', 'KO', 'KP', 'KQ', 'KR',
  'HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH', 'HJ', 'HK', 'HL', 'HM', 'HN', 'HO', 'HP', 'HQ', 'HR',
  'RA', 'RB', 'RC', 'RD', 'RE', 'RF', 'RG', 'RH', 'RJ', 'RK', 'RL', 'RM', 'RN', 'RO', 'RP', 'RQ', 'RR',
  'NA', 'NB', 'NC', 'ND', 'NE', 'NF', 'NG', 'NH', 'NJ', 'NK', 'NL', 'NM', 'NN', 'NO', 'NP', 'NQ', 'NR',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SP', 'SQ', 'SR',
  'GA', 'GB', 'GC', 'GD', 'GE', 'GF', 'GG', 'GH', 'GJ', 'GK', 'GL', 'GM', 'GN', 'GO', 'GP', 'GQ', 'GR',
  // 旧式军牌
  'BA', 'BB', 'BC', 'BD', 'BG', 'BH', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BR', 'BS', 'BT', 'BV'
]

// 军牌归属地映射
const ARMY_DATA: Record<string, { branch: string; unit: string }> = {
  '军': { branch: '中国人民解放军', unit: '军用车辆' },
  // 2012式 - 中央军委及直属
  'VA': { branch: '中央军委', unit: '军委机关' },
  'VB': { branch: '中央军委', unit: '军委办公厅' },
  'VC': { branch: '中央军委', unit: '军委联合参谋部' },
  'VD': { branch: '中央军委', unit: '军委政治工作部' },
  'VE': { branch: '中央军委', unit: '军委后勤保障部' },
  'VF': { branch: '中央军委', unit: '军委装备发展部' },
  'VG': { branch: '中央军委', unit: '军委训练管理部' },
  'VH': { branch: '中央军委', unit: '军委国防动员部' },
  'VJ': { branch: '中央军委', unit: '军委纪检监察委' },
  'VK': { branch: '中央军委', unit: '军委政法委' },
  'VL': { branch: '中央军委', unit: '军委科技委' },
  'VM': { branch: '中央军委', unit: '军委战略规划办' },
  'VN': { branch: '中央军委', unit: '军委改革编制办' },
  'VO': { branch: '中央军委', unit: '军委国际合作办' },
  'VP': { branch: '中央军委', unit: '军委审计署' },
  'VQ': { branch: '中央军委', unit: '军委机关事务管理总局' },
  'VR': { branch: '中央军委', unit: '军委直属单位' },
  // 陆军
  'KA': { branch: '陆军', unit: '陆军机关' },
  'KB': { branch: '陆军', unit: '东部战区陆军' },
  'KC': { branch: '陆军', unit: '南部战区陆军' },
  'KD': { branch: '陆军', unit: '西部战区陆军' },
  'KE': { branch: '陆军', unit: '北部战区陆军' },
  'KF': { branch: '陆军', unit: '中部战区陆军' },
  'KG': { branch: '陆军', unit: '陆军单位' },
  'KH': { branch: '陆军', unit: '陆军单位' },
  'KJ': { branch: '陆军', unit: '陆军单位' },
  'KK': { branch: '陆军', unit: '陆军单位' },
  'KL': { branch: '陆军', unit: '陆军单位' },
  'KM': { branch: '陆军', unit: '陆军单位' },
  'KN': { branch: '陆军', unit: '陆军单位' },
  'KO': { branch: '陆军', unit: '陆军单位' },
  'KP': { branch: '陆军', unit: '陆军单位' },
  'KQ': { branch: '陆军', unit: '陆军单位' },
  'KR': { branch: '陆军', unit: '陆军单位' },
  // 海军
  'HA': { branch: '海军', unit: '海军机关' },
  'HB': { branch: '海军', unit: '北海舰队' },
  'HC': { branch: '海军', unit: '东海舰队' },
  'HD': { branch: '海军', unit: '南海舰队' },
  'HE': { branch: '海军', unit: '海军单位' },
  'HF': { branch: '海军', unit: '海军单位' },
  'HG': { branch: '海军', unit: '海军单位' },
  'HH': { branch: '海军', unit: '海军单位' },
  'HJ': { branch: '海军', unit: '海军单位' },
  'HK': { branch: '海军', unit: '海军单位' },
  'HL': { branch: '海军', unit: '海军单位' },
  'HM': { branch: '海军', unit: '海军单位' },
  'HN': { branch: '海军', unit: '海军单位' },
  'HO': { branch: '海军', unit: '海军单位' },
  'HP': { branch: '海军', unit: '海军单位' },
  'HQ': { branch: '海军', unit: '海军单位' },
  'HR': { branch: '海军', unit: '海军单位' },
  // 空军
  'RA': { branch: '空军', unit: '空军机关' },
  'RB': { branch: '空军', unit: '东部战区空军' },
  'RC': { branch: '空军', unit: '南部战区空军' },
  'RD': { branch: '空军', unit: '西部战区空军' },
  'RE': { branch: '空军', unit: '北部战区空军' },
  'RF': { branch: '空军', unit: '中部战区空军' },
  'RG': { branch: '空军', unit: '空军单位' },
  'RH': { branch: '空军', unit: '空军单位' },
  'RJ': { branch: '空军', unit: '空军单位' },
  'RK': { branch: '空军', unit: '空军单位' },
  'RL': { branch: '空军', unit: '空军单位' },
  'RM': { branch: '空军', unit: '空军单位' },
  'RN': { branch: '空军', unit: '空军单位' },
  'RO': { branch: '空军', unit: '空军单位' },
  'RP': { branch: '空军', unit: '空军单位' },
  'RQ': { branch: '空军', unit: '空军单位' },
  'RR': { branch: '空军', unit: '空军单位' },
  // 火箭军
  'NA': { branch: '火箭军', unit: '火箭军机关' },
  'NB': { branch: '火箭军', unit: '火箭军单位' },
  'NC': { branch: '火箭军', unit: '火箭军单位' },
  'ND': { branch: '火箭军', unit: '火箭军单位' },
  'NE': { branch: '火箭军', unit: '火箭军单位' },
  'NF': { branch: '火箭军', unit: '火箭军单位' },
  'NG': { branch: '火箭军', unit: '火箭军单位' },
  'NH': { branch: '火箭军', unit: '火箭军单位' },
  'NJ': { branch: '火箭军', unit: '火箭军单位' },
  'NK': { branch: '火箭军', unit: '火箭军单位' },
  'NL': { branch: '火箭军', unit: '火箭军单位' },
  'NM': { branch: '火箭军', unit: '火箭军单位' },
  'NN': { branch: '火箭军', unit: '火箭军单位' },
  'NO': { branch: '火箭军', unit: '火箭军单位' },
  'NP': { branch: '火箭军', unit: '火箭军单位' },
  'NQ': { branch: '火箭军', unit: '火箭军单位' },
  'NR': { branch: '火箭军', unit: '火箭军单位' },
  // 战略支援部队
  'SA': { branch: '战略支援部队', unit: '战略支援部队机关' },
  'SB': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SC': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SD': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SE': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SF': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SG': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SH': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SJ': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SK': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SL': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SM': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SN': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SO': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SP': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SQ': { branch: '战略支援部队', unit: '战略支援部队单位' },
  'SR': { branch: '战略支援部队', unit: '战略支援部队单位' },
  // 联勤保障部队
  'GA': { branch: '联勤保障部队', unit: '联勤保障部队机关' },
  'GB': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GC': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GD': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GE': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GF': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GG': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GH': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GJ': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GK': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GL': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GM': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GN': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GO': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GP': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GQ': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  'GR': { branch: '联勤保障部队', unit: '联勤保障部队单位' },
  // 旧式军牌（七大军区时期）
  'BA': { branch: '原北京军区', unit: '北京军区单位' },
  'BB': { branch: '原沈阳军区', unit: '沈阳军区单位' },
  'BC': { branch: '原兰州军区', unit: '兰州军区单位' },
  'BD': { branch: '原济南军区', unit: '济南军区单位' },
  'BG': { branch: '原南京军区', unit: '南京军区单位' },
  'BH': { branch: '原广州军区', unit: '广州军区单位' },
  'BJ': { branch: '原成都军区', unit: '成都军区单位' },
  'BK': { branch: '原总参谋部', unit: '总参单位' },
  'BL': { branch: '原总政治部', unit: '总政单位' },
  'BM': { branch: '原总后勤部', unit: '总后单位' },
  'BN': { branch: '原总装备部', unit: '总装单位' },
  'BO': { branch: '原军事科学院', unit: '军科院' },
  'BP': { branch: '原国防大学', unit: '国防大学' },
  'BR': { branch: '原国防科工委', unit: '国防科工委' },
  'BS': { branch: '原二炮', unit: '第二炮兵' },
  'BT': { branch: '原武警总部', unit: '武警总部' },
  'BV': { branch: '原四总部', unit: '四总部直属' }
}

// 武警地区代码映射
const WJ_REGION_DATA: Record<string, string> = {
  '01': '北京总队', '02': '天津总队', '03': '河北总队', '04': '山西总队',
  '05': '内蒙古总队', '06': '辽宁总队', '07': '吉林总队', '08': '黑龙江总队',
  '09': '上海总队', '10': '江苏总队', '11': '浙江总队', '12': '安徽总队',
  '13': '福建总队', '14': '江西总队', '15': '山东总队', '16': '河南总队',
  '17': '湖北总队', '18': '湖南总队', '19': '广东总队', '20': '广西总队',
  '21': '海南总队', '22': '四川总队', '23': '贵州总队', '24': '云南总队',
  '25': '西藏总队', '26': '陕西总队', '27': '甘肃总队', '28': '青海总队',
  '29': '宁夏总队', '30': '新疆总队', '31': '重庆总队',
  'WJ': '武警总部', 'WD': '武警总部直属'
}

// 使馆车牌
const EMBASSY_PREFIX = '使'

// 港澳车牌特征
const HK_MACAO_PREFIXES = ['粤Z']

// 判断车牌类型
function getPlateType(plate: string): QueryResult['plateType'] {
  // 新能源车牌（7位或8位，包含D或F）
  if (plate.length >= 7) {
    const suffix = plate.slice(2)
    if (suffix.includes('D') || suffix.includes('F')) {
      return 'newEnergy'
    }
  }

  // 使馆车牌
  if (plate.startsWith(EMBASSY_PREFIX)) {
    return 'embassy'
  }

  // 军牌
  for (const prefix of ARMY_PREFIXES) {
    if (plate.startsWith(prefix)) {
      return 'army'
    }
  }

  // 武警车牌
  for (const prefix of Object.keys(SPECIAL_PREFIXES)) {
    if (plate.startsWith(prefix) || plate.includes(prefix)) {
      return SPECIAL_PREFIXES[prefix].type
    }
  }

  // 港澳车牌
  for (const prefix of HK_MACAO_PREFIXES) {
    if (plate.startsWith(prefix)) {
      return 'hongkongMacao'
    }
  }

  return 'normal'
}

// 获取车牌类型文本
function getPlateTypeText(type: QueryResult['plateType']): string {
  const typeMap: Record<QueryResult['plateType'], string> = {
    normal: t('licensePlate.plateTypes.normal'),
    newEnergy: t('licensePlate.plateTypes.newEnergy'),
    police: t('licensePlate.plateTypes.police'),
    army: t('licensePlate.plateTypes.army'),
    embassy: t('licensePlate.plateTypes.embassy'),
    hongkongMacao: t('licensePlate.plateTypes.hongkongMacao')
  }
  return typeMap[type]
}

// 车牌类型对应的样式类
const plateTypeClass = computed(() => {
  if (!queryResult.value) return ''
  return `plate-${queryResult.value.plateType}`
})

function getPlateTypeClass(type: string): string {
  return `plate-${type}`
}

// 识别特殊车牌并返回结果
function getSpecialPlateResult(plate: string): QueryResult | null {
  // 军牌检测：先尝试匹配两字符前缀（VA、BA等），再匹配单字符（军）
  const twoCharPrefix = plate.substring(0, 2)
  if (ARMY_DATA[twoCharPrefix]) {
    const info = ARMY_DATA[twoCharPrefix]
    return {
      plateNumber: plate,
      province: '',
      city: '',
      plateType: 'army',
      plateTypeText: getPlateTypeText('army'),
      isSpecial: true,
      specialInfoList: [
        { label: t('licensePlate.specialLabels.branch'), value: info.branch },
        { label: t('licensePlate.specialLabels.unit'), value: info.unit }
      ]
    }
  }
  const oneCharPrefix = plate.charAt(0)
  if (ARMY_DATA[oneCharPrefix]) {
    const info = ARMY_DATA[oneCharPrefix]
    return {
      plateNumber: plate,
      province: '',
      city: '',
      plateType: 'army',
      plateTypeText: getPlateTypeText('army'),
      isSpecial: true,
      specialInfoList: [
        { label: t('licensePlate.specialLabels.branch'), value: info.branch },
        { label: t('licensePlate.specialLabels.unit'), value: info.unit }
      ]
    }
  }

  // 武警车牌检测：WJ + 2位地区代码
  if (plate.startsWith('WJ')) {
    const regionCode = plate.substring(2, 4)
    const region = WJ_REGION_DATA[regionCode] || t('licensePlate.specialLabels.wjUnknown')
    return {
      plateNumber: plate,
      province: '',
      city: '',
      plateType: 'police',
      plateTypeText: getPlateTypeText('police'),
      isSpecial: true,
      specialInfoList: [
        { label: t('licensePlate.specialLabels.affiliation'), value: t('licensePlate.specialLabels.wjForce') },
        { label: t('licensePlate.specialLabels.region'), value: region }
      ]
    }
  }

  // 使馆车牌检测
  if (plate.startsWith(EMBASSY_PREFIX)) {
    return {
      plateNumber: plate,
      province: '',
      city: '',
      plateType: 'embassy',
      plateTypeText: getPlateTypeText('embassy'),
      isSpecial: true,
      specialInfoList: [
        { label: t('licensePlate.specialLabels.affiliation'), value: t('licensePlate.specialLabels.embassyOrg') }
      ]
    }
  }

  return null
}

// 查询车牌
function handleQuery() {
  const plate = plateNumber.value.trim().toUpperCase()

  if (!plate || plate.length < 2) {
    showToast(t('licensePlate.invalidPlate'))
    return
  }

  // 优先检测特殊车牌
  const specialResult = getSpecialPlateResult(plate)
  if (specialResult) {
    queryResult.value = specialResult
    addToHistory({
      plateNumber: plate,
      province: specialResult.specialInfoList?.[0]?.value || '',
      city: specialResult.specialInfoList?.[1]?.value || '',
      plateType: specialResult.plateType,
      timestamp: Date.now()
    })
    return
  }

  // 普通车牌：获取省份简称
  const provinceCode = plate.charAt(0)
  const cityCode = plate.charAt(1)

  const provinceInfo = PROVINCE_DATA[provinceCode]

  if (!provinceInfo) {
    showToast(t('licensePlate.noResult'))
    queryResult.value = null
    return
  }

  const cityName = provinceInfo.cities[cityCode] || '未知城市'
  const plateType = getPlateType(plate)

  queryResult.value = {
    plateNumber: plate,
    province: provinceInfo.name,
    city: cityName,
    plateType,
    plateTypeText: getPlateTypeText(plateType)
  }

  // 添加到历史记录
  addToHistory({
    plateNumber: plate,
    province: provinceInfo.name,
    city: cityName,
    plateType,
    timestamp: Date.now()
  })
}

// 添加到历史记录
function addToHistory(item: HistoryItem) {
  // 移除重复项
  queryHistory.value = queryHistory.value.filter(h => h.plateNumber !== item.plateNumber)
  // 添加到开头
  queryHistory.value.unshift(item)
  // 最多保留10条
  if (queryHistory.value.length > 10) {
    queryHistory.value = queryHistory.value.slice(0, 10)
  }
  // 保存到本地存储
  saveHistory()
}

// 保存历史到本地存储
function saveHistory() {
  try {
    uni.setStorageSync('licensePlateHistory', JSON.stringify(queryHistory.value))
  } catch (e) {
    console.error('保存历史记录失败', e)
  }
}

// 加载历史记录
function loadHistory() {
  try {
    const data = uni.getStorageSync('licensePlateHistory')
    if (data) {
      queryHistory.value = JSON.parse(data)
    }
  } catch (e) {
    console.error('加载历史记录失败', e)
  }
}

// 清空历史
function handleClearHistory() {
  uni.showModal({
    title: t('common.confirm'),
    content: t('licensePlate.clearHistoryConfirm'),
    success: (res) => {
      if (res.confirm) {
        queryHistory.value = []
        saveHistory()
      }
    }
  })
}

// 从历史记录查询
function queryFromHistory(plate: string) {
  plateNumber.value = plate
  handleQuery()
}

// 插入省份简称
function insertProvince(province: string) {
  plateNumber.value = province + plateNumber.value.slice(1)
}

// 清空输入
function clearInput() {
  plateNumber.value = ''
  queryResult.value = null
}

// 生命周期
onShow(() => {
  settingsStore.initTheme()
  loadHistory()
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: `EH Tools - ${t('licensePlate.title')}`,
    path: '/pages/life/license-plate/index',
    imageUrl: toolShareImageUrl.value || '/static/eh-tools-logo.png'
  }
})

onShareTimeline(() => ({
  title: `EH Tools - ${t('licensePlate.title')}`
}))
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.license-plate-page {
  min-height: 100vh;
  padding: $spacing-md;
  padding-bottom: 0;
  box-sizing: border-box;
  background-color: var(--bg-page);
}

.main-card,
.result-card,
.history-card {
  background-color: var(--bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-neumorphic);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: $spacing-md;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  .card-title {
    margin-bottom: 0;
  }

  .clear-history {
    font-size: 26rpx;
    color: var(--color-primary);
  }
}

// 输入区域
.input-section {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.plate-input {
  width: 100%;
  height: 88rpx;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;
  padding: 0 $spacing-lg;
  padding-right: 80rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: var(--shadow-neumorphic-inset);
  box-sizing: border-box;
  letter-spacing: 4rpx;
}

.clear-btn {
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-sunken);
  border-radius: 50%;

  .clear-icon {
    font-size: 32rpx;
    color: var(--text-secondary);
    line-height: 1;
  }
}

.query-btn {
  width: 160rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-neumorphic-sm);

  &:active {
    transform: scale(0.96);
    box-shadow: var(--shadow-neumorphic-inset);
  }
}

.query-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

// 省份快捷键
.province-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.province-tag {
  width: 64rpx;
  height: 64rpx;
  background-color: var(--bg-elevated);
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: var(--shadow-neumorphic-sm);

  &:active {
    box-shadow: var(--shadow-neumorphic-inset);
    transform: scale(0.95);
  }
}

// 结果展示
.result-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.plate-preview {
  height: 120rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2980b9 0%, #1a5276 100%);
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);

  &.plate-newEnergy {
    background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
  }

  &.plate-police {
    background: linear-gradient(135deg, #ffffff 0%, #ecf0f1 100%);
    border-color: #c0392b;

    .plate-preview-text {
      color: #c0392b;
    }
  }

  &.plate-army {
    background: linear-gradient(135deg, #ffffff 0%, #ecf0f1 100%);
    border-color: #c0392b;

    .plate-preview-text {
      color: #c0392b;
    }
  }

  &.plate-embassy {
    background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
    border-color: #c0392b;
  }

  &.plate-hongkongMacao {
    background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
    border-color: #ffffff;
  }
}

.plate-preview-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;
}

.result-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.result-value {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

// 历史记录
.history-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.history-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: var(--bg-elevated);
  border-radius: $radius-md;

  &:active {
    background-color: var(--bg-sunken);
  }
}

.history-plate {
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-sm;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2980b9 0%, #1a5276 100%);

  &.plate-newEnergy {
    background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
  }

  &.plate-police,
  &.plate-army {
    background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
    color: #c0392b;
  }

  &.plate-embassy,
  &.plate-hongkongMacao {
    background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
  }
}

.history-info {
  flex: 1;
}

.history-location {
  font-size: 28rpx;
  color: var(--text-primary);
}

</style>
