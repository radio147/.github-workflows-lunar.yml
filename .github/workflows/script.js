const axios = require('axios');

// 获取当前日期
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, '0');
const d = String(now.getDate()).padStart(2, '0');
const dateStr = y + '-' + m + '-' + d;

// 获取环境变量
const txKey = process.env.TX_KEY;
const sctKey = process.env.SCT_KEY;

if (!txKey || !sctKey) {
  console.error('❌ 缺少环境变量 TX_KEY 或 SCT_KEY');
  process.exit(1);
}

console.log('📅 正在获取 ' + dateStr + ' 的数据...');

axios.get('https://api.tianapi.com/lunar/index.php', {
  params: { key: txKey, date: dateStr }
})
.then(res => {
  if (res.data.code !== 200) {
    throw new Error('天行API错误: ' + (res.data.msg || '未知错误'));
  }
  
  const r = res.data.result;
  
  // 【关键】这里使用 + 号拼接，绝对安全，不会有任何 ${} 符号
  const title = '📅 今日农历简报 (' + dateStr + ')';
  const content = 
    '公历：**' + dateStr + '**\n' +
    '农历：**' + r.luncalendar + '**\n' +
    '干支：' + r.yeargz + '年 ' + r.monthgz + '月 ' + r.daygz + '日\n' +
    '生肖：' + r.shengxiao + '\n' +
    '宜：' + r.yi.join('、') + '\n' +
    '忌：' + r.ji.join('、');

  console.log('数据获取成功，正在推送...');

  return axios.post('https://sctapi.ftqq.com/' + sctKey + '.send', null, {
    params: {
      title: title,
      desp: content
    }
  });
})
.then(sctRes => {
  if (sctRes.data.code === 0) {
    console.log('✅ 推送成功！');
  } else {
    console.log('⚠️ 推送结果:', sctRes.data.message);
  }
})
.catch(err => {
  console.error('❌ 发生严重错误:', err.message);
  process.exit(1);
});
