import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";
import type {
  LineItem,
  Draft,
  DraftRequest,
  Order,
  ConfirmOrderPayload,
  ReadyOrderDTO,
} from "./types";
import type { RootState } from "../../../store";

// 1) 대리점 품목 목록 조회
export const fetchAgencyProducts = createAsyncThunk<
  LineItem[],
  string,
  { rejectValue: string }
>(
  "agency/fetchAgencyProducts",
  async (agencyId, thunkAPI) => {
    try {
      const response = await api.get(`/agency-items/${agencyId}/products`);
      const normalized = response.data.map((p: any) => ({
        id: p.pdKey,
        pdKey: p.pdKey,
        sku: p.pdNum,
        name: p.pdProducts,
        qty: 1,
        price: p.pdPrice,
      }));
      return normalized;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "대리점 품목 불러오기 실패");
    }
  }
);

// 2) 임시 저장 (draft) POST
export const saveDraft = createAsyncThunk<
  Draft[],            // 서버 응답 Draft 배열
  ReadyOrderDTO[],    // ReadyOrderDTO 배열 그대로 보내기
  { rejectValue: string }
>(
  "agency/saveDraft",
  async (items, thunkAPI) => {
    try {
      const response = await api.post(`/agencyorder/draft`, items);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "임시 저장 실패");
    }
  }
);

// 3) 주문 확정 POST
export const confirmOrder = createAsyncThunk<
  Order,
  ConfirmOrderPayload,
  { rejectValue: string }
>(
  "agency/confirmOrder",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/agencyorder/confirm", payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "주문 확정 실패");
    }
  }
);

// 4) 대리점 주문 목록 조회 (쿼리 파라미터로 agencyId 전달하도록 수정)
export const fetchAgencyOrders = createAsyncThunk<Order[], number, { rejectValue: string; state: RootState }>(
  "agency/fetchAgencyOrders",
  async (agencyId, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("토큰이 없습니다.");
      }

      const response = await api.get(`/agencyorder`, {
        params: { agencyId },
      });

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "주문 리스트 불러오기 실패");
    }
  }
);


// 5) 주문 삭제 thunk (orderKeys string[] → 숫자로 변환 후 삭제 호출)
export const deleteOrders = createAsyncThunk<
  string[],         // 성공 시 삭제된 주문 orKey 배열 반환
  string[],         // 인자로 삭제할 주문 orKey 배열 받음
  { rejectValue: string; state: RootState }
>(
  "agency/deleteOrders",
  async (orderKeys, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("토큰이 없습니다.");
      }

      // 숫자 변환 및 삭제 호출
      await Promise.all(
        orderKeys.map((id) =>
          api.delete(`/agencyorder/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );


      return orderKeys;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "주문 삭제 실패");
    }
  }
);
