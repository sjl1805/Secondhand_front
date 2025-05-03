/**
 * 省市区数据 (简化版)
 * 实际项目中应当使用完整的省市区数据
 */

const regionData = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '门头沟区', label: '门头沟区' },
          { value: '房山区', label: '房山区' },
          { value: '通州区', label: '通州区' },
          { value: '顺义区', label: '顺义区' },
          { value: '昌平区', label: '昌平区' },
          { value: '大兴区', label: '大兴区' },
          { value: '怀柔区', label: '怀柔区' },
          { value: '平谷区', label: '平谷区' },
          { value: '密云区', label: '密云区' },
          { value: '延庆区', label: '延庆区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' },
          { value: '杨浦区', label: '杨浦区' },
          { value: '闵行区', label: '闵行区' },
          { value: '宝山区', label: '宝山区' },
          { value: '嘉定区', label: '嘉定区' },
          { value: '浦东新区', label: '浦东新区' },
          { value: '金山区', label: '金山区' },
          { value: '松江区', label: '松江区' },
          { value: '青浦区', label: '青浦区' },
          { value: '奉贤区', label: '奉贤区' },
          { value: '崇明区', label: '崇明区' }
        ]
      }
    ]
  },
  {
    value: '天津市',
    label: '天津市',
    children: [
      {
        value: '天津市',
        label: '天津市',
        children: [
          { value: '和平区', label: '和平区' },
          { value: '河东区', label: '河东区' },
          { value: '河西区', label: '河西区' },
          { value: '南开区', label: '南开区' },
          { value: '河北区', label: '河北区' },
          { value: '红桥区', label: '红桥区' },
          { value: '东丽区', label: '东丽区' },
          { value: '西青区', label: '西青区' },
          { value: '津南区', label: '津南区' },
          { value: '北辰区', label: '北辰区' },
          { value: '武清区', label: '武清区' },
          { value: '宝坻区', label: '宝坻区' },
          { value: '滨海新区', label: '滨海新区' },
          { value: '宁河区', label: '宁河区' },
          { value: '静海区', label: '静海区' },
          { value: '蓟州区', label: '蓟州区' }
        ]
      }
    ]
  },
  {
    value: '重庆市',
    label: '重庆市',
    children: [
      {
        value: '重庆市',
        label: '重庆市',
        children: [
          { value: '渝中区', label: '渝中区' },
          { value: '万州区', label: '万州区' },
          { value: '涪陵区', label: '涪陵区' },
          { value: '大渡口区', label: '大渡口区' },
          { value: '江北区', label: '江北区' },
          { value: '沙坪坝区', label: '沙坪坝区' },
          { value: '九龙坡区', label: '九龙坡区' },
          { value: '南岸区', label: '南岸区' },
          { value: '北碚区', label: '北碚区' },
          { value: '渝北区', label: '渝北区' },
          { value: '巴南区', label: '巴南区' },
          { value: '黔江区', label: '黔江区' },
          { value: '长寿区', label: '长寿区' },
          { value: '江津区', label: '江津区' },
          { value: '合川区', label: '合川区' },
          { value: '永川区', label: '永川区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '荔湾区', label: '荔湾区' },
          { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' },
          { value: '黄埔区', label: '黄埔区' },
          { value: '番禺区', label: '番禺区' },
          { value: '花都区', label: '花都区' },
          { value: '南沙区', label: '南沙区' },
          { value: '从化区', label: '从化区' },
          { value: '增城区', label: '增城区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' },
          { value: '盐田区', label: '盐田区' },
          { value: '龙华区', label: '龙华区' },
          { value: '坪山区', label: '坪山区' },
          { value: '光明区', label: '光明区' }
        ]
      },
      {
        value: '佛山市',
        label: '佛山市',
        children: [
          { value: '禅城区', label: '禅城区' },
          { value: '南海区', label: '南海区' },
          { value: '顺德区', label: '顺德区' },
          { value: '三水区', label: '三水区' },
          { value: '高明区', label: '高明区' }
        ]
      },
      {
        value: '东莞市',
        label: '东莞市',
        children: [
          { value: '东城街道', label: '东城街道' },
          { value: '南城街道', label: '南城街道' },
          { value: '万江街道', label: '万江街道' },
          { value: '莞城街道', label: '莞城街道' },
          { value: '虎门镇', label: '虎门镇' },
          { value: '长安镇', label: '长安镇' }
        ]
      }
    ]
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      {
        value: '南京市',
        label: '南京市',
        children: [
          { value: '玄武区', label: '玄武区' },
          { value: '秦淮区', label: '秦淮区' },
          { value: '建邺区', label: '建邺区' },
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '浦口区', label: '浦口区' },
          { value: '栖霞区', label: '栖霞区' },
          { value: '雨花台区', label: '雨花台区' },
          { value: '江宁区', label: '江宁区' },
          { value: '六合区', label: '六合区' },
          { value: '溧水区', label: '溧水区' },
          { value: '高淳区', label: '高淳区' }
        ]
      },
      {
        value: '苏州市',
        label: '苏州市',
        children: [
          { value: '姑苏区', label: '姑苏区' },
          { value: '吴中区', label: '吴中区' },
          { value: '相城区', label: '相城区' },
          { value: '高新区', label: '高新区' },
          { value: '工业园区', label: '工业园区' },
          { value: '吴江区', label: '吴江区' },
          { value: '常熟市', label: '常熟市' },
          { value: '张家港市', label: '张家港市' },
          { value: '昆山市', label: '昆山市' },
          { value: '太仓市', label: '太仓市' }
        ]
      },
      {
        value: '无锡市',
        label: '无锡市',
        children: [
          { value: '梁溪区', label: '梁溪区' },
          { value: '锡山区', label: '锡山区' },
          { value: '惠山区', label: '惠山区' },
          { value: '滨湖区', label: '滨湖区' },
          { value: '新吴区', label: '新吴区' },
          { value: '江阴市', label: '江阴市' },
          { value: '宜兴市', label: '宜兴市' }
        ]
      }
    ]
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      {
        value: '杭州市',
        label: '杭州市',
        children: [
          { value: '上城区', label: '上城区' },
          { value: '下城区', label: '下城区' },
          { value: '江干区', label: '江干区' },
          { value: '拱墅区', label: '拱墅区' },
          { value: '西湖区', label: '西湖区' },
          { value: '滨江区', label: '滨江区' },
          { value: '萧山区', label: '萧山区' },
          { value: '余杭区', label: '余杭区' },
          { value: '富阳区', label: '富阳区' },
          { value: '临安区', label: '临安区' },
          { value: '钱塘区', label: '钱塘区' },
          { value: '临平区', label: '临平区' }
        ]
      },
      {
        value: '宁波市',
        label: '宁波市',
        children: [
          { value: '海曙区', label: '海曙区' },
          { value: '江北区', label: '江北区' },
          { value: '北仑区', label: '北仑区' },
          { value: '镇海区', label: '镇海区' },
          { value: '鄞州区', label: '鄞州区' },
          { value: '奉化区', label: '奉化区' },
          { value: '余姚市', label: '余姚市' },
          { value: '慈溪市', label: '慈溪市' },
          { value: '宁海县', label: '宁海县' },
          { value: '象山县', label: '象山县' }
        ]
      },
      {
        value: '温州市',
        label: '温州市',
        children: [
          { value: '鹿城区', label: '鹿城区' },
          { value: '龙湾区', label: '龙湾区' },
          { value: '瓯海区', label: '瓯海区' },
          { value: '洞头区', label: '洞头区' },
          { value: '瑞安市', label: '瑞安市' },
          { value: '乐清市', label: '乐清市' }
        ]
      }
    ]
  },
  {
    value: '四川省',
    label: '四川省',
    children: [
      {
        value: '成都市',
        label: '成都市',
        children: [
          { value: '锦江区', label: '锦江区' },
          { value: '青羊区', label: '青羊区' },
          { value: '金牛区', label: '金牛区' },
          { value: '武侯区', label: '武侯区' },
          { value: '成华区', label: '成华区' },
          { value: '龙泉驿区', label: '龙泉驿区' },
          { value: '青白江区', label: '青白江区' },
          { value: '新都区', label: '新都区' },
          { value: '温江区', label: '温江区' },
          { value: '双流区', label: '双流区' },
          { value: '郫都区', label: '郫都区' }
        ]
      },
      {
        value: '绵阳市',
        label: '绵阳市',
        children: [
          { value: '涪城区', label: '涪城区' },
          { value: '游仙区', label: '游仙区' },
          { value: '安州区', label: '安州区' },
          { value: '江油市', label: '江油市' }
        ]
      }
    ]
  },
  {
    value: '湖北省',
    label: '湖北省',
    children: [
      {
        value: '武汉市',
        label: '武汉市',
        children: [
          { value: '江岸区', label: '江岸区' },
          { value: '江汉区', label: '江汉区' },
          { value: '硚口区', label: '硚口区' },
          { value: '汉阳区', label: '汉阳区' },
          { value: '武昌区', label: '武昌区' },
          { value: '青山区', label: '青山区' },
          { value: '洪山区', label: '洪山区' },
          { value: '东西湖区', label: '东西湖区' },
          { value: '汉南区', label: '汉南区' },
          { value: '蔡甸区', label: '蔡甸区' },
          { value: '江夏区', label: '江夏区' },
          { value: '黄陂区', label: '黄陂区' },
          { value: '新洲区', label: '新洲区' }
        ]
      },
      {
        value: '宜昌市',
        label: '宜昌市',
        children: [
          { value: '西陵区', label: '西陵区' },
          { value: '伍家岗区', label: '伍家岗区' },
          { value: '点军区', label: '点军区' },
          { value: '猇亭区', label: '猇亭区' },
          { value: '夷陵区', label: '夷陵区' }
        ]
      }
    ]
  },
  {
    value: '湖南省',
    label: '湖南省',
    children: [
      {
        value: '长沙市',
        label: '长沙市',
        children: [
          { value: '芙蓉区', label: '芙蓉区' },
          { value: '天心区', label: '天心区' },
          { value: '岳麓区', label: '岳麓区' },
          { value: '开福区', label: '开福区' },
          { value: '雨花区', label: '雨花区' },
          { value: '望城区', label: '望城区' },
          { value: '长沙县', label: '长沙县' },
          { value: '浏阳市', label: '浏阳市' },
          { value: '宁乡市', label: '宁乡市' }
        ]
      },
      {
        value: '株洲市',
        label: '株洲市',
        children: [
          { value: '天元区', label: '天元区' },
          { value: '荷塘区', label: '荷塘区' },
          { value: '芦淞区', label: '芦淞区' },
          { value: '石峰区', label: '石峰区' },
          { value: '渌口区', label: '渌口区' }
        ]
      }
    ]
  },
  {
    value: '安徽省',
    label: '安徽省',
    children: [
      {
        value: '合肥市',
        label: '合肥市',
        children: [
          { value: '瑶海区', label: '瑶海区' },
          { value: '庐阳区', label: '庐阳区' },
          { value: '蜀山区', label: '蜀山区' },
          { value: '包河区', label: '包河区' },
          { value: '经开区', label: '经开区' },
          { value: '高新区', label: '高新区' },
          { value: '新站区', label: '新站区' },
          { value: '肥东县', label: '肥东县' },
          { value: '肥西县', label: '肥西县' },
          { value: '长丰县', label: '长丰县' },
          { value: '庐江县', label: '庐江县' }
        ]
      },
      {
        value: '芜湖市',
        label: '芜湖市',
        children: [
          { value: '镜湖区', label: '镜湖区' },
          { value: '弋江区', label: '弋江区' },
          { value: '鸠江区', label: '鸠江区' },
          { value: '湾沚区', label: '湾沚区' },
          { value: '繁昌区', label: '繁昌区' },
          { value: '无为市', label: '无为市' },
          { value: '南陵县', label: '南陵县' }
        ]
      },
      {
        value: '安庆市',
        label: '安庆市',
        children: [
          { value: '迎江区', label: '迎江区' },
          { value: '大观区', label: '大观区' },
          { value: '宜秀区', label: '宜秀区' },
          { value: '桐城市', label: '桐城市' },
          { value: '怀宁县', label: '怀宁县' },
          { value: '潜山市', label: '潜山市' }
        ]
      },
      {
        value: '蚌埠市',
        label: '蚌埠市',
        children: [
          { value: '蚌山区', label: '蚌山区' },
          { value: '龙子湖区', label: '龙子湖区' },
          { value: '禹会区', label: '禹会区' },
          { value: '淮上区', label: '淮上区' },
          { value: '怀远县', label: '怀远县' },
          { value: '固镇县', label: '固镇县' },
          { value: '五河县', label: '五河县' }
        ]
      },
      {
        value: '黄山市',
        label: '黄山市',
        children: [
          { value: '屯溪区', label: '屯溪区' },
          { value: '黄山区', label: '黄山区' },
          { value: '徽州区', label: '徽州区' },
          { value: '歙县', label: '歙县' },
          { value: '休宁县', label: '休宁县' },
          { value: '黟县', label: '黟县' },
          { value: '祁门县', label: '祁门县' }
        ]
      },
      {
        value: '马鞍山市',
        label: '马鞍山市',
        children: [
          { value: '花山区', label: '花山区' },
          { value: '雨山区', label: '雨山区' },
          { value: '博望区', label: '博望区' },
          { value: '当涂县', label: '当涂县' },
          { value: '含山县', label: '含山县' },
          { value: '和县', label: '和县' }
        ]
      }
    ]
  }
]

export default regionData 