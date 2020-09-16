import zh from './zh_TW.js';

// 自定義設定檔案，錯誤的 className
VeeValidate.configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  },
});

// 載入自訂規則包
VeeValidate.localize('tw', zh);

// 將 VeeValidate input 驗證工具載入 作為全域註冊
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
// 將 VeeValidate 完整表單 驗證工具載入 作為全域註冊
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
// 掛載 Vue-Loading 套件
Vue.use(VueLoading);
// 全域註冊 VueLoading 並標籤設定為 loading
Vue.component('loading', VueLoading);

new Vue({
  el: '#app',
  data: {
    products: [],
    tempProduct: {
      num: 0,
    },
    status: {
      loadingItem: '',//預設值
    },
    form: {
      name: '',
      email: '',
      tel: '',
      address: '',
      payment: '',
      message: '',
    },
    cart: {},
    cartTotal: 0,
    isLoading: false,
    UUID: '74dfdd02-bd64-495e-963c-25429417612d',
    APIPATH: 'https://course-ec-api.hexschool.io',
  },
  created() {
    this.getProducts();
    this.getCart();
  },
  methods: { 
    getProducts(page = 1) { //產品資料獲取方法
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/products?page=${page}`;
      axios.get(url).then((response) => {
        this.products = response.data.data;
        }).catch(error=>{
          this.isLoading = false;
        })
    },
    getDetailed(id) { //查看更多方法
      this.status.loadingItem = id;

      const url = `${this.APIPATH}/api/${this.UUID}/ec/product/${id}`;

      axios.get(url).then((response) => {
        this.tempProduct = response.data.data;
        // 由於 tempProduct 的 num 沒有預設數字
        // 因此 options 無法選擇預設欄位，故要增加這一行解決該問題
        this.status.loadingItem = '';
        this.tempProduct.num = 1; //預設值為1 
        $('#productModal').modal('show');
        this.status.loadingItem = '';
      });
    },
    addToCart(item, quantity = 1) { //查看更多裡的加入購物車方法
      this.status.loadingItem = item.id;

      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping`;

      const cart = {
        product: item.id,
        quantity,
      };

      axios.post(url, cart).then(() => {
        this.status.loadingItem = '';
        $('#productModal').modal('hide');
        this.getCart();
      }).catch((error) => {
        this.status.loadingItem = '';
        console.log(error.response.data.errors);
        $('#productModal').modal('hide');
      });
    },
    getCart() {  //取得購物車內容
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping`;

      axios.get(url).then((response) => {
        this.cart = response.data.data;
        this.updateToatal();
        this.isLoading = false;
        });
    },
    updateToatal(){ //更新總額方法
      this.cart.forEach((item) => {
        this.cartTotal += item.product.price * item.quantity;
      });
    },
    updateToatal(){
      this.cart.forEach((item) => {
        this.cartTotal += item.product.price * item.quantity;
      });
    },
    quantityUpdata(id, num) { //加減數量方法
      // 避免商品數量低於 0 個
      if(num <= 0) return;

      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping`;

      const data = {
        product: id,
        quantity: num,
      };

      axios.patch(url, data).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    removeAllCartItem() { //刪除總品項方法
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping/all/product`;

      axios.delete(url)
        .then(() => {
          this.isLoading = false;
          this.getCart();
        });
    },
    removeCartItem(id) { //刪除該品項方法，依樣對應id去做刪除
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/shopping/${id}`;

      axios.delete(url).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    createOrder() { //送出表單方法
      this.isLoading = true;
      const url = `${this.APIPATH}/api/${this.UUID}/ec/orders`;

      axios.post(url, this.form).then((response) => {
        if (response.data.data.id) {
          this.isLoading = false;
          // 跳出提示訊息
          $('#orderModal').modal('show');

          // 重新渲染購物車
          this.getCart();
        }
      }).catch((error) => {
        this.isLoading = false;
        console.log(error.response.data.errors);
      });
    },
  },
});