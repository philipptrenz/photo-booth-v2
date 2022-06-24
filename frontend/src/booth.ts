import { createApp } from 'vue';
import { createStore } from 'vuex';
import Booth from './Booth.vue';
import VueSocketIO from 'vue-3-socket.io';
import SocketIO from 'socket.io-client';
import './index.css';

const app = createApp(Booth)


const store = createStore({
  state () {
    return {}
  },
  mutations: {}
})
app.use(store);

const socketIO = new VueSocketIO({
  debug: true,
  connection: SocketIO('ws://127.0.0.1:5000', {}), // options object is Optional
  vuex: {
    store,
    actionPrefix: "SOCKET_",
    mutationPrefix: "SOCKET_"
  },
});
app.use(socketIO);

app.mount('#app');


