// App.tsx or Payment.tsx
import React, { useState, useEffect } from 'react';

const DATA_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiCqR2KZx5iTfK0WpnZ12ROGLavXxJ5CmTEozAfGzUhz4r3LskRPmYjm6ddHFDqOfysnohcO64KBu_s8WdJLggylUauzv7_UXuIpx_6GgbQ7rjBWqQLM_VSObBpfPeodz-Bj4_ubIGSx24YYZQt5NFA32WQWOOtoEezcouGWIeB0MgWwdFgHRs-T2wTs2MJV56iMfbOfTsP_-oYnIsZGmPsor9EVgWnkv35zX5IgORW90B0QskBvXxB3OInOjX5jei2H3UgSbt_s1Gnzqos8G0Cto00vw&lib=MIQziLwT1MCXZr6Qq9BcMmcyyKctprk1A";

function Payment() {
  const [input, setInput] = useState('');
  const [rawData, setRawData] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(DATA_URL);
        const json = await res.json();
        setRawData(json);
        console.log(json);
      } catch (err) {
        console.error("資料載入失敗", err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (value: string) => {
    setInput(value);

    const keyword = value.trim().toLowerCase();
    if (!keyword) {
      setResults([]);
      return;
    }

    const matched = [];

    for (const activity of rawData) {
      const matchedUsers = activity.data.filter(user =>
        user.name?.toLowerCase().includes(keyword) ||
        user.phone?.includes(keyword) ||
        user.team?.toLowerCase().includes(keyword)
      );

      if (matchedUsers.length > 0) {
        matched.push({
          activityName: activity.activityName,
          activityId: activity.activityId,
          users: matchedUsers
        });
      }
    }

    setResults(matched);
  };

  return (
    <div className="p-4 font-sans">
      <h2>學員課程查詢</h2>
      <input
        type="text"
        placeholder="請輸入姓名、電話或小組"
        value={input}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: '0.5rem', width: '300px', fontSize: '1rem' }}
      />

      {results.length > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          {results.map((entry, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <strong>活動：</strong> {entry.activityName}（ID: {entry.activityId}）
              <ul>
                {entry.users.map((user, j) => (
                  <li key={j}>
                    {user.name} | {user.phone} | 小組：{user.team}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : input ? (
        <p style={{ marginTop: '2rem' }}>找不到符合的學員</p>
      ) : null}
    </div>
  );
}

export default Payment;
