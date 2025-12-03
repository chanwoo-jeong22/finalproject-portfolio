import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";
import type {
  LineItem,
  Draft,
  DraftRequest,
  Order,
  ConfirmOrderPayload,
  ReadyOrderDTO, // 여기 추가
} from "./types";

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
