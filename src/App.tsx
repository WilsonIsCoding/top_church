import { useEffect, useState } from 'react'

function App() {
  // 資料格式：[{區域, 組別, 姓名}]
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // 選擇狀態
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedNames, setSelectedNames] = useState([])

  // 表單輸入資料
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')

  // 讀取資料：GET
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://script.google.com/macros/s/AKfycbym97_uDsvWQfGKCnxBhdkxWlssOBKWH3cOqSztQMSSL3b9IR7BeFgrAYebSXayYpe3hA/exec')
        const json = await res.json()
        const converted = json.map((item: any) => {
          // 從物件取得牧區（使徒）、組別（2102）、跟人名
          // 因為 key 名稱會變，先挑前三個 key 來做 mapping
          const keys = Object.keys(item)
          // 假設結構固定為三個 key
          const groupKey = keys.find(k => !isNaN(Number(k)))  // 找組別 key ("2102")
          const areaKey = keys.find(k => item[k] === k)       // 找牧區 key ("使徒":"使徒")
          const personKey = keys.find(k => k !== groupKey && k !== areaKey) // 剩下的人名 key ("丁曼娟")
        
          return [item[areaKey], String(item[groupKey]), item[personKey]]
        })
        console.log('取得資料', converted)
        setData(converted)
      } catch (error) {
        console.error('讀取資料失敗', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 取得所有牧區(區域)
  const areas = Array.from(new Set(data.map(d => d[0])))

  // 根據選擇的牧區取得組別
  const groups = selectedArea
    ? Array.from(new Set(data.filter(d => d[0] === selectedArea).map(d => d[1])))
    : []

  // 根據牧區+組別取得人名
  const names = (selectedArea && selectedGroup)
    ? data.filter(d => d[0] === selectedArea && d[1] === selectedGroup).map(d => d[2])
    : []

  // checkbox 改變
  const toggleName = (name) => {
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  // POST 送出
  const handleSubmit = async () => {
    if (!formName || !formEmail || selectedNames.length === 0) {
      alert('請填寫姓名、Email，並選擇至少一位人員')
      return
    }

    const payload = {
      name: formName,
      email: formEmail,
      message: formMessage,
      selectedNames,
      area: selectedArea,
      group: selectedGroup,
    }

    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbym97_uDsvWQfGKCnxBhdkxWlssOBKWH3cOqSztQMSSL3b9IR7BeFgrAYebSXayYpe3hA/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      alert('送出成功：' + JSON.stringify(data))
    } catch (error) {
      alert('送出失敗: ' + error.message)
    }
  }

  if (loading) return <div>讀取中...</div>

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto', fontFamily: 'Arial' }}>
      <h1>簡易 Google 表單</h1>

      {/* 基本輸入 */}
      <div style={{ marginBottom: 20 }}>
        <label>
          填寫人姓名：
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>
          Email：
          <input
            value={formEmail}
            onChange={e => setFormEmail(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>

      {/* 牧區下拉 */}
      <div style={{ marginBottom: 20 }}>
        <label>
          牧區：
          <select
            value={selectedArea}
            onChange={e => {
              setSelectedArea(e.target.value)
              setSelectedGroup('')
              setSelectedNames([])
            }}
            style={{ marginLeft: 8 }}
          >
            <option value="">請選擇牧區</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 組別下拉 */}
      <div style={{ marginBottom: 20 }}>
        <label>
          組別：
          <select
            disabled={!selectedArea}
            value={selectedGroup}
            onChange={e => {
              setSelectedGroup(e.target.value)
              setSelectedNames([])
            }}
            style={{ marginLeft: 8 }}
          >
            <option value="">請選擇組別</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>

      {/* checkbox 人名 */}
      <div style={{ marginBottom: 20 }}>
        <label>人名：</label>
        <div style={{ paddingLeft: 20 }}>
          {names.length === 0 && <div style={{ color: '#888' }}>請先選擇牧區與組別</div>}
          {names.map(name => (
            <div key={name}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedNames.includes(name)}
                  onChange={() => toggleName(name)}
                />
                {name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 訊息 */}
      <div style={{ marginBottom: 20 }}>
        <label>
          備註：
          <textarea
            rows={3}
            value={formMessage}
            onChange={e => setFormMessage(e.target.value)}
            style={{ width: '100%', marginTop: 8 }}
          />
        </label>
      </div>

      <button onClick={handleSubmit}>送出</button>
    </div>
  )
}

export default App
