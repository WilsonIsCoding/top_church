import React, { useEffect, useState } from "react";

type Person = {
  uid: string;
  name: string;
  phone: string;
  group: string;
  team: string;
};

type Activity = {
  activityName: string;
  activityId: string;
  data: Person[];
};

export default function PaymentSearch() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [query, setQuery] = useState("");
  // 紀錄已標記繳費的uid集合
  const [paidUids, setPaidUids] = useState<Set<string>>(new Set());
  // 紀錄正在送出的uid集合（loading狀態）
  const [loadingUids, setLoadingUids] = useState<Set<string>>(new Set());
    const formUrl =
    "https://script.google.com/macros/s/AKfycbyuKNxAbv8Yi_X4xQaK3uQy9AdP_c1WVJoEMXaAiWk0R__HmW3hLh3iK0yWn9Z3QiKg/exec";
  useEffect(() => {
    fetch(formUrl)
      .then((res) => res.json())
      .then(setActivities)
      .catch((err) => console.error("載入失敗", err));
  }, []);

  const filtered = activities.flatMap((activity) =>
    activity.data
      .filter(
        (person) =>
          person.name.includes(query) ||
          person.phone.includes(query) ||
          person.team.includes(query)
      )
      .map((person) => ({
        ...person,
        activityName: activity.activityName,
        activityId: activity.activityId,
      }))
  );

  async function markAsPaid(person: Person & { activityName: string }) {
    if (loadingUids.has(person.uid) || paidUids.has(person.uid)) return;

    setLoadingUids((prev) => new Set(prev).add(person.uid));
    try {
      const res = await fetch(formUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify({
            activityName: person.activityName,
            name: person.name,
          }),
            }
      );
      const data = await res.json();
      if (res.status === 200) {
        setPaidUids((prev) => new Set(prev).add(person.uid));
        alert(data.message);
      } else {
        alert("繳費失敗：" + data.message);
      }
    } catch (error) {
      alert("網路錯誤：" + error);
    }finally{
      setLoadingUids((prev) => {
        const copy = new Set(prev);
        copy.delete(person.uid);
        return copy;
      });
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">繳費查詢</h1>
      <input
        type="text"
        className="w-full p-3 border border-gray-400 rounded-lg mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
        placeholder="輸入姓名、電話或小組"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="min-h-[120px] space-y-2">
        {filtered.map((person) => (
          <div
            key={`${person.uid || person.phone || person.name}_${person.activityId || ''}`}
            className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
          >
            <div>
              <p className="font-medium text-gray-900">{person.name}</p>
              <p className="text-sm text-gray-500">
                📱 {person.phone} ｜ 🏷️ {person.team} ｜ 📘 {person.activityName}
              </p>
            </div>
            <button
              onClick={() => markAsPaid(person)}
              disabled={paidUids.has(person.uid) || loadingUids.has(person.uid)}
              className={`px-4 py-1 rounded-lg text-sm transition
                ${
                  paidUids.has(person.uid)
                    ? "bg-green-500 text-white cursor-default"
                    : loadingUids.has(person.uid)
                    ? "bg-gray-400 text-white cursor-wait"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }
              `}
            >
              {paidUids.has(person.uid)
                ? "已繳費"
                : loadingUids.has(person.uid)
                ? "處理中..."
                : "標記已繳費"}
            </button>
          </div>
        ))}

        {filtered.length === 0 && query && (
          <p className="text-gray-500 text-center">查無符合資料</p>
        )}
      </div>
    </div>
  );
}
