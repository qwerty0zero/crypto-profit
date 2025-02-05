<template>
  <section>


    <div class="grid-container">
      <div class="grid-item">
        <customSelect @getElement="getCurrencyT($event)" v-model="selected"
          @update:modelValue="$event => (foo = $event)" :list=currencyList></customSelect>

      </div>
      <div class="grid-item">
        <DatePicker :minRange="tokenFirstDate" @getDataRange="getDataRange($event)"></DatePicker>
      </div>
    </div>

    <div class="grid-container row-2">
      <div class="grid-item">

        <p>Provide investments frequency: 1-30 days</p>
        <vue-number-input :min="1" :max="30" placeholder="Transaction intervals" center controls
          v-model="investmentRange" class="darkInput"></vue-number-input>
      </div>

      <div class="grid-item">
        <p>Enter the investment amount: </p>
        <vue-number-input placeholder="Enter the amount" v-model="startAmount" class="darkInput"></vue-number-input>
      </div>

      <div class="grid-item" v-show="!tabletSize">
        <div class="btn button" @click="getHistoricalData()"> Calculate</div>
      </div>

      <div class="grid-item">
        <p>Date: {{ startDate }} - {{ endDate }}</p>
        <p>Payments: {{ paymentsCount == 0 ? '-' : paymentsCount }}</p>
        <p>Investment amount: {{ budget == 0 ? '-' : budget }}</p>
      </div>

    </div>

    <div class="grid-container row-3" v-show="tabletSize">

      <div class="grid-item">
        <div class="btn button" @click="getHistoricalData()"> Calculate</div>
      </div>

    </div>

    <button class="scroll-btn button" :class="scrollBtnActive ? 'active' : ''" v-show="userPositionTop"
      onclick="window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })">Scroll Down</button>

    <button class="scroll-btn button" :class="scrollBtnActive ? 'active' : ''" v-show="!userPositionTop"
      onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">Scroll Up</button>


    <ProfitTable v-if="investments[0] != null" :data="investments" :totalData="totalInvestments"
      :todayData="todaysPrice" :currency="selectedCurency"></ProfitTable>

  </section>
</template>

<script>

import customSelect from "@/components/customSelect.vue"
import DatePicker from "@/components/DatePicker.vue";
import ProfitTable from "@/components/ProfitTable.vue";
import VueNumberInput from '@chenfengyuan/vue-number-input';

export default {
  data() {
    return {

      tabletSize: window.innerWidth <= 900 ? true : false,
      userPositionTop: true,
      scrollBtnActive: document.body.scrollHeight > window.innerHeight,
      startAmount: null,
      currencyList: [],
      rangeList: [1, 7, 14, 30],
      tokenFirstDate: null,
      startDate: null,
      endDate: null,
      daysRange: null,
      daysRangeToToday: null,
      fullRange: this.daysRange + this.daysRangeToToday,
      instruments: null,
      rangeMarket: [],
      investmentRange: 1,
      ivestmentData: null,
      selectedCurency: null,
      selectedCurencyChange: false,
      budget: 0,
      paymentsCount: 0,
      investments: [],
      averageInvestments: [],
      selected: 0,
      totalInvestments: {
        "TotalAmount": 0,
        "TotalProfit": 0,
        "TotalPrice": 0,
        "AvarageIntialPrice": 0

      },
      todayMarketHistory: [],
      todaysPrice: null,
      API_KEY: 'de78cf92e4de0b8490532234b53b74cf79b29a6282b24f44b223fe3087e6c5d4'
    }
  },
  components: { customSelect, DatePicker, ProfitTable, VueNumberInput },

  mounted() {

    this.scrollBtnActive = document.body.scrollHeight > window.innerHeight

    window.addEventListener('resize', () => {
      this.tabletSize = window.innerWidth <= 900 ? true : false
    })
    window.addEventListener("scroll", () => {

      this.scrollBtnActive = document.body.scrollHeight > window.innerHeight

      if (window.scrollY === 0)
        this.userPositionTop = true
      else if (window.innerHeight + window.scrollY >= document.body.offsetHeight)
        this.userPositionTop = false


    });

    this.getTop100CurrencyList()
  },
  methods: {

    getTop100CurrencyList() {
      const baseUrl = 'https://data-api.cryptocompare.com/asset/v1/top/list';
      const params = {
        page: 1,
        page_size: 100,
        sort_by: "CIRCULATING_MKT_CAP_USD",
        sort_direction: "DESC",
        groups: "ID,PRICE,BASIC,TOPLIST_RANK",
        toplist_quote_asset: "USD",
        api_key: this.API_KEY
      };

      const url = new URL(baseUrl);
      url.search = new URLSearchParams(params).toString();

      const options = {
        method: 'GET',
        headers: { "Content-type": "application/json; charset=UTF-8" },
      };

      fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((json) => {
          let data = json;
          data = Object.values(data)[0].LIST

          for (let el of data) {
            let obj = {
              "SYMBOL": el.SYMBOL,
              "logoUrl": el.LOGO_URL,
              "URI": el.URI,
              "name": el.NAME,
              "rank": el.TOPLIST_BASE_RANK.CIRCULATING_MKT_CAP_USD,
              "price": el.PRICE_USD,
            }
            this.currencyList.push(obj)
          }
        })
        .catch((err) => console.error('Error:', err));
    },
    getCurrencyT(el) {
      this.selectedCurrency = el
      this.selectedCurency = el.SYMBOL
      const baseUrl = 'https://data-api.cryptocompare.com/index/cc/v1/latest/tick';
      this.instruments = `${el.SYMBOL}-USD`
      const params = {
        "market": "cadli",
        "instruments": this.instruments,
        "apply_mapping": "true",
        "groups": "LIFETIME",
        "api_key": this.API_KEY
      };

      const url = new URL(baseUrl);
      url.search = new URLSearchParams(params).toString();

      const options = {
        method: 'GET',
        headers: { "Content-type": "application/json; charset=UTF-8" },
      };

      fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((json) => {
          const lifetimeFirstUpdateTs = Object.values(Object.values(json)[0])[0].LIFETIME_FIRST_UPDATE_TS;
          this.tokenFirstDate = new Date(lifetimeFirstUpdateTs * 1000)

          const currentDate = new Date();
          const oneDay = 1000 * 60 * 60 * 24;
          const daysDifference = Math.floor((currentDate - this.tokenFirstDate) / oneDay);

          if (daysDifference >= 5000) {
            const pastDate = new Date(Date.now() - 4999 * oneDay);
            this.tokenFirstDate = pastDate.toISOString()
          }

        })

      this.forceRender();

    },
    async forceRender() {
      this.selectedCurencyChange = true
      await this.$nextTick();
      this.selectedCurencyChange = false
    },
    getDataRange(el) {
      let str = el.toString()
      this.startDate = str.split(',')[0]
      this.endDate = str.split(',')[1]

      let date1 = new Date(el[0]);
      let date2 = new Date(el[1]);

      let Difference_In_Time = date2.getTime() - date1.getTime();
      let Difference_In_Time2 = new Date().getTime() - date2.getTime()


      this.daysRange = Math.round(Difference_In_Time / (1000 * 3600 * 24));
      this.daysRangeToToday = Math.round(Difference_In_Time2 / (1000 * 3600 * 24)) - 1;

      this.fullRange = 0
      this.fullRange = this.daysRange + this.daysRangeToToday + 1



    },
    getHistoricalData() {
      if (this.selectedCurency === null) {
        alert("Select currency")
        return
      }

      if (isNaN(this.fullRange) || this.fullRange == 0) {
        alert("Select date range")
        return
      }

      this.investments = []
      this.budget = this.startAmount

      if (isNaN(this.budget) || this.fullRange == 0) {
        alert("Enter the investment amount")
        return
      }


      const baseUrl = 'https://data-api.cryptocompare.com/index/cc/v1/historical/days';
      const params = {
        "market": "cadli",
        "instrument": this.instruments,
        "limit": this.fullRange,
        "aggregate": 1,
        "fill": "true",
        "apply_mapping": "true",
        "response_format": "JSON",
        "groups": "OHLC",
        "api_key": this.API_KEY
      };
      const url = new URL(baseUrl);
      url.search = new URLSearchParams(params).toString();

      const options = {
        method: 'GET',
        headers: { "Content-type": "application/json; charset=UTF-8" },
      };

      fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((json) => {
          this.todayMarketHistory = null
          const fullMarketHistory = Object.values(Object.values(json)[0]);
          this.todayMarketHistory = fullMarketHistory[fullMarketHistory.length - 1]

          this.todaysPrice = (this.todayMarketHistory.HIGH + this.todayMarketHistory.LOW) / 2
          this.rangeMarket = fullMarketHistory.splice(0, this.daysRange + 1)
          this.getAllInvestmentData()
        })
      this.scrollBtnActive = true

    },
    changeRange(el) {
      this.investmentRange = parseInt(el)
    },
    getAllInvestmentData() {
      this.totalInvestments = {
        "TotalAmount": 0,
        "TotalProfit": 0,
        "TotalPrice": 0,
        "AvarageIntialPrice": 0
      }
      this.paymentsCount = 0
      this.paymentsCount = Math.floor(this.daysRange / this.investmentRange) + 1
      for (let i = 0; i < this.rangeMarket.length; i += this.investmentRange)
        this.calculateInvastmentDate(this.rangeMarket[i])
      this.totalInvestments.AvarageIntialPrice = this.totalInvestments.AvarageIntialPrice / this.paymentsCount

    },
    calculateInvastmentDate(el) {
      let price = (el.HIGH + el.LOW) / 2
      let currencyCount = ((this.budget / this.paymentsCount) / price)
      let date = new Date(el.TIMESTAMP * 1000)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      let obj = {
        "date": `${day}.${month}.${year}`,
        "price": price,
        "amount": currencyCount,
        "spend": (this.budget / this.paymentsCount),
        "currency": this.selectedCurency,
        "profit": (this.todaysPrice - price) * currencyCount
      }
      this.totalInvestments.TotalAmount += currencyCount
      this.totalInvestments.TotalProfit += (this.todaysPrice - price) * currencyCount
      this.totalInvestments.TotalPrice += (this.budget / this.paymentsCount)
      this.totalInvestments.AvarageIntialPrice += price

      this.investments.push(obj)

    }
  }
}

</script>

<style scoped>
.scroll-btn {
  position: fixed;
  bottom: 20px;
  right: -150%;
  transition: 0.3s;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.scroll-btn.active {
  right: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.row-2 {
  grid-template-columns: repeat(4, 1fr);
}

.row-3 {
  grid-template-columns: repeat(1, 1fr);

}

.grid-item {
  align-items: center;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.grid-item>*,
.vue-number-input__input {
  width: 100% !important;

}


.darkInput * {
  background: #303030 !important;
  border: 0px !important;
  color: #E0E0E0;

}

.darkInput *::before,
.darkInput *::after,
.vue-number-input__button {
  opacity: 1 !important;
  background-color: #E0E0E0 !important;
}

.darkInput *:disabled:before,
.darkInput *:disabled:after,
.vue-number-input__button {
  opacity: 1 !important;
  background-color: #8f8f8f !important;
}


section {

  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 30px;
  gap: 15px;
}

.btn {
  min-height: 100%;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
  padding: 20px;
}

.button {
  background-color: #c1c1c1;
  border: 1px solid #c1c1c1;
  color: #0e0e0e;
  transition: 0.3s;
}

.button:hover {
  background-color: #0e0e0e;
  color: #c1c1c1;
}

@media screen and (max-width: 900px) {
  .row-2 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 680px) {
  .grid-container {
    grid-template-columns: repeat(1, 1fr);
  }

  section {
    min-height: 100vh;
    padding: 15px;
  }
}

@media screen and (max-width: 680px) {
  .grid-container:first-child {
    padding-top: 15px;
  }

  .grid-container {
    padding: 0 15px;

  }

  section {
    padding: 0px;
  }

}
</style>
