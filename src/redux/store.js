import {configureStore } from '@reduxjs/toolkit';
// import { } from './api/apliSlice';
import chatSlice from './features/chats/chatSlice'

export const store = configureStore({
    reducer: {
        chat: chatSlice
    },
});
export default store;
















/**
 *  Create Store
 *   -configureStore() -RTK
 *  
 *  Provider my Store to app
 *   -<Provider store={store}/> -import from react-redux
 *   
 *  Slice
 *   -createSlice() - import react-redux/toolkit
 *   -RTK - createSlice({
 *      name: "",
 *      intialStae:,
 *      reducers:{
 *          addItem: (state, action) =>{state = action.paylaod} //do not return
 *      }
 * })
 * 
 *  export default cartSlice.reducer
 *  export const {addItem} = cartSlice.actions
 * 
 * 
 * ///////////////
 *   Put that {Slice} into Store
 *      -{
 *        reducer: {
 *          cartName: cartslice,
 * u        user: userSlice
 *      }
 *         }
 */