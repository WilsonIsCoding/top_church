import { useEffect, useState } from "react";
import logo from "./assets/kvMain.webp";
import BibleVerseLoader from "./components/BibleVerseLoader";
import { toast } from "react-toastify";
function App() {
  // 資料格式：[{區域, 組別, 姓名}]
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 選擇狀態
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const formUrl =
    "https://script.google.com/macros/s/AKfycbxNoiJIeJfUd4gfJSy6D5yfKk7g8Ve4TWmm2F46EoW9XeC7Y4Hu_cKmVEIFttv7MVA-/exec";

  // 取得所有牧區(區域)
  const areas = Array.from(new Set(data.map((d) => d[0])));

  // 根據選擇的牧區取得組別
  const groups = selectedArea
    ? Array.from(
        new Set(data.filter((d) => d[0] === selectedArea).map((d) => d[1]))
      )
    : [];

  // 根據牧區+組別取得人名
  const names =
    selectedArea && selectedGroup
      ? data
          .filter((d) => d[0] === selectedArea && d[1] === selectedGroup)
          .map((d) => d[2])
      : [];

  // checkbox 改變
  const toggleName = (name: string) => {
    setSelectedNames((prev: string[]) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // 讀取資料：GET
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(formUrl);
        const json = await res.json();
        const converted = json
          .map((item: any) => {
            let area = "";
            let group = "";
            const people: string[] = [];

            Object.values(item).forEach((value) => {
              if (!value) return;
              const strValue = String(value);

              if (!area && /^[\u4e00-\u9fa5]+$/.test(strValue)) {
                area = strValue;
              } else if (!group) {
                group = strValue;
              } else if (people.length < 1) {
                // ✅ 只抓一個人名（第三欄）
                people.push(strValue);
              }
            });

            return people.map((name) => [area, group, name]); // [['使徒', '2102', '丁曼娟']]
          })
          .flat();

        setData(converted);
      } catch (error) {
        console.error("讀取資料失敗", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  const handleSubmit = async () => {
    setLoading(true);

    const payload = names.map((name) => ({
      area: selectedArea,
      group: selectedGroup,
      name,
      status: selectedNames.includes(name) ? true : false,
      message: formMessage,
    }));

    try {
      const res = await fetch(formUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // 注意：GAS 要接收 raw body，必須設為 text/plain
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      await res.json(); // 後端回傳 JSON 字串
      toast.success(`成功送出！`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("送出失敗", error);
      toast.error(` 送出失敗，請稍後再試`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false); // 無論成功失敗都要結束 loading
      setSelectedNames([]);
      setSelectedGroup("");
      setSelectedArea("");
    }
  };

  if (loading) return <BibleVerseLoader />;

  return (
    <div
      style={{
        padding: 10,
        maxWidth: 600,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        color: "#333",
      }}
    >
      <img
        style={{
          width: "100%",
          height: "auto",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          cursor: "pointer",
        }}
        src={logo}
        alt="新店行道會"
        onClick={() => {
          window.open("https://www.topchurch.net/", "_blank");
        }}
      />

      {/* 牧區下拉 */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontWeight: "600",
            fontSize: 16,
            display: "block",
            marginBottom: 6,
          }}
        >
          牧區：
        </label>
        {/* 牧區選單 */}
        <select
          value={selectedArea}
          onChange={(e) => {
            setSelectedArea(e.target.value);
            setSelectedGroup("");
            setSelectedNames([]);
          }}
          style={{
            backgroundColor: "white",
            color: "black",
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #ccc",
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        >
          <option value="">請選擇牧區</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* 組別下拉 */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontWeight: "600",
            fontSize: 16,
            display: "block",
            marginBottom: 6,
          }}
        >
          組別：
        </label>
        <select
          disabled={!selectedArea}
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            setSelectedNames([]);
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #ccc",
            outline: "none",
            backgroundColor: !selectedArea ? "#eee" : "white",
            cursor: !selectedArea ? "not-allowed" : "pointer",
            transition: "border-color 0.3s",
            color: !selectedArea ? "#888" : "black",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        >
          <option value="">請選擇組別</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* checkbox 已完成第三梯次的組員： */}
      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontWeight: "600",
            fontSize: 16,
            display: "block",
            marginBottom: 8,
          }}
        >
          已完成第三梯次的組員：
        </label>
        <div
          style={{
            maxHeight: 200,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 8,
            backgroundColor: "#fff",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          {names.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", padding: 16 }}>
              請先選擇牧區與組別
            </div>
          )}
          {/* 全選勾選框 */}
          {names.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontWeight: "600",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedNames.length === names.length}
                  onChange={() => {
                    if (selectedNames.length === names.length) {
                      setSelectedNames([]);
                    } else {
                      setSelectedNames([...names]);
                    }
                  }}
                  style={{ marginRight: 8, cursor: "pointer" }}
                />
                全選
              </label>
            </div>
          )}
          {names.map((name) => (
            <div key={name} style={{ marginBottom: 6 }}>
              <label
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedNames.includes(name)}
                  onChange={() => toggleName(name)}
                  style={{ cursor: "pointer" }}
                />
                {name}
              </label>
            </div>
          ))}
        </div>
      </div>
        {/* 訊息 */}
        <div style={{ marginBottom: 32 }}>
        <label
          style={{
            fontWeight: "600",
            fontSize: 16,
            display: "block",
            marginBottom: 8,
          }}
        >
          備註：
        </label>
        <textarea
          rows={3}
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
          placeholder="請輸入備註..."
          style={{
            backgroundColor: "white",
            color: "black",
            width: "-webkit-fill-available",
            padding: 12,
            fontSize: 15,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "vertical",
            outline: "none",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.1)",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          maxWidth: "none",
          width: "100%",
          padding: "14px 0",
          fontSize: 18,
          fontWeight: "600",
          color: "white",
          backgroundColor: "#3498db",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(52, 152, 219, 0.4)",
          transition: "background-color 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2980b9";
          e.currentTarget.style.boxShadow =
            "0 6px 12px rgba(41, 128, 185, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#3498db";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(52, 152, 219, 0.4)";
        }}
      >
        送出
      </button>
    </div>
  );
}

export default App;
