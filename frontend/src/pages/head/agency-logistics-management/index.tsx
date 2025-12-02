import React, { useState, useEffect, ChangeEvent } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import api from "../../../api/api";
import headStyles from "../../../styles/head/head.module.css";
import UserRegister from "../../../components/head/userregister/index";

interface User {
  userKey: number;
  type: string;      
  userId: string;
  userName: string;
  address: string;
  tel: string;
}

function AgencyLogisticsManagement() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>("2");

  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCheckedUsers({}); // 필터 변경시 체크박스 초기화
  };

  const filteredUsers = users.filter(user => {
    if (filterType === "2") return user.type === "logistic";
    if (filterType === "3") return user.type === "agency";
    return true;
  });

  const handleRegisterSuccess = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    closeRegister();
  };

  const getUserKey = (user: User) => `${user.type}-${user.userKey}`;

  const handleCheckChange = (user: User) => {
    const key = getUserKey(user);
    setCheckedUsers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckAll = (e: ChangeEvent<HTMLInputElement>) => {
    const allChecked = e.target.checked;
    const newChecked: Record<string, boolean> = {};
    filteredUsers.forEach(user => {
      newChecked[getUserKey(user)] = allChecked;
    });
    setCheckedUsers(newChecked);
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = users
      .filter(u => checkedUsers[getUserKey(u)])
      .map(u => u.userKey);

    if (idsToDelete.length === 0) {
      alert("삭제할 유저를 선택해주세요.");
      return;
    }

    if (!window.confirm(`${idsToDelete.length}명의 유저를 정말 삭제하시겠습니까?`)) return;

    try {
      await api.post(
        "/users/delete",
        { userIds: idsToDelete },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(prev => prev.filter(u => !idsToDelete.includes(u.userKey)));
      setCheckedUsers({});
      alert("선택된 유저를 삭제했습니다.");
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;

      try {
        const res = await api.get<User[]>("/users/list", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        alert("유저 데이터 로드 실패");
      }
    };
    fetchUsers();
  }, [token]);

  return (
    <div className={`${headStyles.content} ${headStyles.content_grid}`}>
      <h1 className={headStyles.title}>대리점 및 물류업체 관리</h1>

      <section className={headStyles.sec_full}>
        <div className={headStyles.select_wrap}>
          <div className={headStyles.left_select_wrap}>
            <div className={headStyles.left_select}>
              <div className={headStyles.section}>
                <h5>분류</h5>
                <select className={headStyles.select_w120} value={filterType} onChange={handleFilterChange}>
                  <option value="2">물류업체</option>
                  <option value="3">대리점</option>
                </select>
              </div>
            </div>
          </div>

          <div className={headStyles.right_select}>
            <button className={`${headStyles.btn} ${headStyles.register}`} onClick={openRegister}>
              등록
            </button>
            <button className={`${headStyles.btn} ${headStyles.delete}`} onClick={handleDeleteSelected}>
              삭제
            </button>
          </div>
        </div>

        <div className={headStyles.table_container}>
          <table className={`${headStyles.table} ${headStyles.table_userPd}`}>
            <thead>
              <tr>
                <th className={headStyles.t_check_box}>
                  <input
                    type="checkbox"
                    id="checkAll"
                    checked={filteredUsers.length > 0 && filteredUsers.every(u => checkedUsers[getUserKey(u)])}
                    onChange={handleCheckAll}
                  />
                  <label htmlFor="checkAll"></label>
                </th>
                <th>업체명</th>
                <th>이름</th>
                <th>주소</th>
                <th>전화번호</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const key = getUserKey(user);
                const isChecked = !!checkedUsers[key];
                return (
                  <tr key={key} className={isChecked ? headStyles.checkedRow : ""}>
                    <td className={headStyles.t_check_box}>
                      <input
                        type="checkbox"
                        id={`check-${key}`}
                        checked={isChecked}
                        onChange={() => handleCheckChange(user)}
                      />
                      <label htmlFor={`check-${key}`}></label>
                    </td>
                    <td>{user.userId}</td>
                    <td>{user.userName}</td>
                    <td>{user.address}</td>
                    <td>{user.tel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isRegisterOpen && (
        <div className={headStyles.modalBackdrop} onClick={closeRegister}>
          <div className={headStyles.modal} onClick={(e) => e.stopPropagation()}>
            <UserRegister onClose={closeRegister} onRegisterSuccess={handleRegisterSuccess} token={token} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyLogisticsManagement;
