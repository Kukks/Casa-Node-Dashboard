<template>
  <form @submit.prevent="update()">
      <div class="alert modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Ready to update?</p>
        </header>
        <section class="modal-card-body">
          <b-loading :is-full-page="true" :active.sync="data.isLoading"></b-loading>
          <p>Your device will restart while it updates. You will not be able to connect to your node while it's updating. Please enter your password to confirm the update.</p><br>
          <b-field>
            <b-input type="password" v-model="data.password" placeholder="Enter password" required></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <a class="button cancel" type="button" @click="$parent.close()">Abort</a>
          <button class="button is-casa" type="submit">Confirm</button>
        </footer>
      </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {
  name: 'ConfirmUpdate',

  data() {
    return {
      data: {
        password: '',
        isLoading: false
      }
    }
  },

  methods: {

    async update() {
      const basicAuthConfig = {
        method: 'post',
        url: `${this.$env.UPDATE_MANAGER}/v1/update`,
        auth: {username: 'user', password: this.data.password}
      };

      try {
        this.data.isLoading = true;
        await axios(basicAuthConfig);
        // Close Modal and Settings Panel
        this.$emit('close');
        EventBus.$emit('updating');
        this.$snackbar.open({message:'Software is updating. Please reload this window in 5 minutes.', type:'is-success', position:'is-top', indefinite: true});
      } catch (err) {
        this.$snackbar.open({message:`Update failed: ${err.response.data}`, type:'is-danger', position:'is-top', indefinite: true});
      } finally {
        this.data.isLoading = false;
        this.data.password = '';
      }
    }

  }
};
</script>
