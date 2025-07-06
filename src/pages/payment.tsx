import { useEffect, useState } from "react";
import BibleVerseLoader from "../components/BibleVerseLoader";
type Person = {
  uid: string;
  name: string;
  phone: string;
  group: string;
  team: string;
  已繳費?: string; // 新增 "已繳費" 欄位
};

type Activity = {
  activityName: string;
  activityId: string;
  activityPrice: number;
  data: Person[];
};

export default function PaymentSearch() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [handler, setHandler] = useState("請選擇經手人");
  // 紀錄已標記繳費的uid集合
  const [paidUids, setPaidUids] = useState<Set<string>>(new Set());
  // 紀錄正在送出的uid集合（loading狀態）
  const [submitting, setSubmitting] = useState(false);
  // 選擇查看某個學員的詳細資料
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const firstSightVerses = ["初次載入，請稍等..."];
  const submittingVerses = ["繳費記錄中，請稍等..."];
  const formUrl =
    "https://script.google.com/macros/s/AKfycbyyjPbYfjj_3ZfRLTm_ohpjF1QHe_0hTRGL6DRpTmKE4EgGq0c9uQ1bK6eOA2KYfYOy/exec";

  // 經手人配置
  const hadlerConfig = ["請選擇經手人", "又藺", "璧瑄", "若望", "玉榕", "宥辰", "芳瑜", "皓軒"];
  // 過濾出符合查詢條件的學員
  const filtered = activities.flatMap((activity) => {
    return activity.data
      .filter(
        (person) =>
          person.name.includes(query) ||
          person.phone.includes(query) ||
          person.team.includes(query) ||
          person.group.includes(query) ||
          activity.activityName.includes(query)
      )
      .map((person) => ({
        ...person,
        activityName: activity.activityName,
        activityId: activity.activityId,
        activityPrice: activity.activityPrice,
      }));
  });
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // 如果不是有效日期，返回原始字串
    return date.toLocaleDateString("en-US"); // 格式化為 MM/DD
  }
  async function markAsPaid(person: Person & { activityName: string }) {
    if (handler === "請選擇經手人") {
      alert("請選擇經手人");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(formUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          activityName: person.activityName,
          name: person.name,
          handler: handler,
          price: person.activityPrice,
        }),
      });
      const data = await res.json();
      if (res.status === 200) {
        setPaidUids((prev) => new Set(prev).add(person.uid));
        alert(data.message);
        setSelectedPerson(null);
      } else {
        alert("繳費失敗：" + data.message);
      }
    } catch (error) {
      alert("網路錯誤：" + error);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetch(formUrl)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data); // 設定資料到 state
      })
      .catch((err) => console.error("載入失敗", err))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <BibleVerseLoader verses={firstSightVerses} />;
  if (submitting) return <BibleVerseLoader verses={submittingVerses} />;

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">學員資料查詢</h1>
        <select
          className="w-1/3 p-3 border border-gray-400 rounded-lg mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
          value={handler}
          onChange={(e) => setHandler(e.target.value)}
        >
          {hadlerConfig.map((handler) => (
            <option key={handler} value={handler}>
              {handler}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        className="w-full p-3 border border-gray-400 rounded-lg mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
        placeholder="輸入姓名、電話、小組、活動名稱"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="min-h-[120px] space-y-2">
        {filtered.map((person) => (
          <div
            key={`${person.uid || person.phone || person.name}_${
              person.activityId || ""
            }`}
            className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
          >
            <div>
              <p className="font-medium text-gray-900">{person.name}</p>
              <p className="text-sm text-gray-500">
                📱 {person.phone} ｜ 🏷️ {person.team} ｜ 📘{" "}
                {person.activityName}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPerson(person);
              }} // 顯示詳細資料
              className="px-4 cursor-pointer py-1 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600"
            >
              詳細資料
            </button>
          </div>
        ))}

        {filtered.length === 0 && query && (
          <p className="text-gray-500 text-center">查無符合資料</p>
        )}
      </div>

      {/* 彈出詳細資料視窗 */}
      {selectedPerson && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full shadow-lg relative">
            <button
              onClick={() => setSelectedPerson(null)}
              className="absolute top-2 right-2 px-4 py-2 bg-gray-500 text-white rounded-full cursor-pointer"
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {selectedPerson.name} {selectedPerson.activityName} 報名資訊{" "}
            </h2>

            {/* 水平滾動容器 */}
            <div className="overflow-x-auto">
              <table className="min-w-max table-auto border-collapse">
                <thead>
                  <tr>
                    {/* 渲染 selectedPerson 的資料 */}
                    {Object.entries(selectedPerson).map(([key, value]) => {
                      const formattedValue =
                        key && !isNaN(Date.parse(key)) ? formatDate(key) : key;
                      return (
                        <th className="px-4 py-2 border" key={`th-${key}`}>
                          {formattedValue || ""}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* 渲染 selectedPerson 的資料 */}
                    {Object.entries(selectedPerson).map(([key, value]) => {
                      return (
                        <td key={`td-${key}`} className="px-4 py-2 border">
                          {value || ""}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 已繳費按鈕 */}
            <button
              onClick={() => markAsPaid(selectedPerson)}
              className={`my-4 cursor-pointer block mx-auto px-4 py-2 rounded-lg 
                        ${
                          paidUids.has(selectedPerson.uid) ||
                          selectedPerson["已繳費"]
                            ? "bg-amber-900 text-white disabled:opacity-50 disabled:cursor-not-allowed" // 已繳費
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        } // 未繳費
                      `}
              disabled={
                paidUids.has(selectedPerson.uid) || selectedPerson["已繳費"]
              } // 按鈕禁用已繳費學員
            >
              {paidUids.has(selectedPerson.uid) || selectedPerson["已繳費"]
                ? "學員已繳費"
                : "標記為已繳費"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
