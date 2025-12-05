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

/**
 * 1) 대리점 품목 목록 조회
 */
export const fetchAgencyProducts = createAsyncThunk<
  LineItem[],
  string,
  { rejectValue: string }
>(
  "agency/fetchAgencyProducts",
  async (agencyId, thunkAPI) => {
    try {
      const response = await api.get(`/agency-items/${agencyId}/products`);
      const normalized: LineItem[] = response.data.map((p: {
        pdKey: number;
        pdNum: string;
        pdProducts: string;
        pdPrice: number;
      }) => ({
        id: p.pdKey,
        pdKey: p.pdKey,
        sku: p.pdNum,
        name: p.pdProducts,
        qty: 1,
        price: p.pdPrice,
      }));
      return normalized;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "대리점 품목 불러오기 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * 2) 임시 저장 (draft) POST
 */
export const saveDraft = createAsyncThunk<
  Draft[],
  ReadyOrderDTO[],
  { rejectValue: string }
>(
  "agency/saveDraft",
  async (items, thunkAPI) => {
    try {
      const response = await api.post(`/agencyorder/draft`, items);
      return response.data as Draft[];
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "임시 저장 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * 2-1) 임시 저장 목록 조회 GET
 */
export const fetchDrafts = createAsyncThunk<
  Draft[],
  void,
  { rejectValue: string; state: RootState }
>(
  "agency/fetchDrafts",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;
      if (!token) {
        return thunkAPI.rejectWithValue("로그인이 필요합니다.");
      }

      const agKey = state.auth.userInfo?.agKey;
      if (!agKey) {
        return thunkAPI.rejectWithValue("대리점 키가 없습니다.");
      }

      const response = await api.get(`/agencyorder/draft?agKey=${agKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data as Draft[];
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "임시 저장 목록 불러오기 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * 3) 주문 확정 POST
 */
export const confirmOrder = createAsyncThunk<
  Order,
  ConfirmOrderPayload,
  { rejectValue: string }
>(
  "agency/confirmOrder",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/agencyorder/confirm", payload);
      return response.data as Order;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "주문 확정 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * 4) 대리점 주문 목록 조회 (agencyId 쿼리 파라미터 전달)
 */
export const fetchAgencyOrders = createAsyncThunk<
  Order[],
  number,
  { rejectValue: string; state: RootState }
>(
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

      return response.data as Order[];
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "주문 리스트 불러오기 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * 5) 주문 삭제 thunk (orderKeys string[] → 숫자로 변환 후 삭제 호출)
 */
export const deleteOrders = createAsyncThunk<
  string[],
  string[],
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

      await Promise.all(
        orderKeys.map((id) =>
          api.delete(`/agencyorder/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      return orderKeys;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "주문 삭제 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * 6) 임시 저장 삭제 thunk (draftIds: number[] 삭제용)
 */
export const deleteDrafts = createAsyncThunk<
  number[],
  number[],
  { rejectValue: string; state: RootState }
>(
  "agency/deleteDrafts",
  async (draftIds, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("토큰이 없습니다.");
      }

      await Promise.all(
        draftIds.map((id) =>
          api.delete(`/agencyorder/draft/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      return draftIds;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "임시 저장 삭제 실패";
      return thunkAPI.rejectWithValue(message);
    }
  }
);
