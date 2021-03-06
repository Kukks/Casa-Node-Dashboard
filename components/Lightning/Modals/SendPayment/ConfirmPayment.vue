<template>
  <form class="withdraw channel-manager" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Confirm Payment</span>
        </p>
      </header>
      <section class="modal-card-body">
        <!-- Payment Request Info -->
        <div class="equalColWrap eqFlexWrap">
          <template v-if="payment.numSatoshis < 1">
            <div class="withdrawal-amount request-amount">
              <h2>Amount to Send</h2>
              <div class="field is-grouped">
                <div class="field is-expanded">
                  <p class="control is-expanded has-icons-right">
                    <input class="input" type="number" v-model="customAmount">
                    <span class="icon is-small is-right"><i>BTC</i></span>
                  </p>
                </div>
                <div class="field is-expanded">
                  <p class="control is-expanded has-icons-right">
                    <input class="input" type="number" :value="getDollarValue">
                    <span class="icon is-small is-right"><i>USD</i></span>
                  </p>
                </div>
              </div>
            </div>
          </template>

          <div class="equalFlexCol eqFlexField">
            <span class="info-label">Payment Code</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{payment.paymentRequest}}</span>
          </div>

          <template v-if="payment.numSatoshis > 0">
            <div class="equalFlexCol eqFlexField">
              <span class="info-label">Sending</span>
            </div>
            <div class="equalFlexCol eqFlexField">
              <span class="info-light">{{payment.numSatoshis | btc}} BTC</span>
            </div>
          </template>

          <template v-else>
            <div class="equalFlexCol eqFlexField">
              <span class="info-label">Max Potential Payment</span>
            </div>
            <div class="equalFlexCol eqFlexField">
              <span class="info-light">{{lightning.maxPaymentOut | btc}} BTC</span>
            </div>
          </template>

          <div class="equalFlexCol eqFlexField">
            <span class="info-label">New Lightning Balance</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{getBalance | btc}} BTC</span>
          </div>

        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Cancel</a>
        <a class="button is-casa" type="button" @click="confirm()">Confirm</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import LightningData from '@/data/lightning';

export default {
  name: 'ConfirmInvoice',

  props: {
    invoice: this.invoice
  },

  computed: {
    getDollarValue: function() {
      return (this.customAmount * this.bitcoin.price).toFixed(2);
    },

    getBalance: function() {
      if(parseInt(this.payment.numSatoshis) > 0) {
        return parseInt(this.lightning.balance.confirmed) - parseInt(this.payment.numSatoshis);
      } else {
        return parseInt(this.lightning.balance.confirmed) - (this.customAmount * 100000000);
      }
    },
  },

  data() {
    return {
      bitcoin: BitcoinData,
      lightning: LightningData,
      payment: {},
      newBalance: 0,
      customAmount: 0,
    };
  },

  async created() {
    try {
      const payment = await this.$axios.get(`${this.$env.API_LND}/v1/lnd/lightning/invoice?paymentRequest=${this.invoice}`);
      this.payment = payment.data;
    } catch(error) {
      this.$toast.open({duration: 4000, message: error.response.data, position: 'is-top',type: 'is-danger'})
      this.$emit('close');
    }
  },

  methods: {
    async confirm() {
      EventBus.$emit('loading-start');

      try {
        var payload = {paymentRequest: this.invoice}

        if(this.customAmount > 0) {
          payload.amt = Math.round(this.customAmount * 100000000);
        }

        var pay = await this.$axios.post(`${this.$env.API_LND}/v1/lnd/lightning/payInvoice`, payload);
        EventBus.$emit('confirmedPayment', pay.data);
      } catch(error) {
        this.$toast.open({duration: 4000, message: error.response.data, position: 'is-top',type: 'is-danger'})
      }

      this.$emit('close');
      EventBus.$emit('loading-stop');

      // Reload transaction info after sending
      EventBus.$emit('load-lightning-stats');
      EventBus.$emit('load-lightning-transactions');
    }
  }
};
</script>
