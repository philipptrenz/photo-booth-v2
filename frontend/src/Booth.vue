<template>

  <main 
    @click="capture"
    class="relative w-full h-full min-h-screen min-w-screen flex justify-center items-center bg-black text-white "
    :class="isCapturing ? 'cursor-default' : 'cursor-pointer'">

    <section class="absolute inset-0 p-6 w-full overflow-hidden items-center grid grid-cols-3 gap-6">
      <img v-for="imageUrl in imageUrls" v-bind:key="imageUrl" :src="imageUrl" class="grayscale rounded-xl">
    </section>

    <section 
      v-if="countdown !== null || newImageUrl !== null" 
      class="z-50 absolute inset-0 bg-black bg-opacity-80 w-full h-full flex justify-center items-center transition delay-500">

      <span v-if="countdown > 0" class="text-9xl transition">{{ countdown }}</span>

      <svg v-if="countdown == -2 && !newImageUrl" class="animate-spin" width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 120C52.9242 120 42.0972 116.716 32.8881 110.562C23.6789 104.409 16.5013 95.6629 12.2627 85.4303C8.02424 75.1976 6.91525 63.9379 9.07602 53.0749C11.2368 42.212 16.5703 32.2338 24.402 24.402C32.2338 16.5703 42.212 11.2368 53.0749 9.07602C63.9379 6.91525 75.1976 8.02424 85.4303 12.2627C95.6629 16.5013 104.409 23.6789 110.562 32.8881C116.716 42.0972 120 52.9242 120 64" stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <div v-if="newImageUrl" class="h-full w-full p-10">
        <img :src="newImageUrl" class="w-full h-full grayscale rounded-xl object-cover">
      </div>

    </section>

  </main>
</template>



<script lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Booth',
  data() {
    return {
      maxImages: 15,

      cameras: '',

      isCapturing: false,
      countdown: null as any,
      interval: null as any,

      imageUrls: [] as any[],
      newImageUrl: null,
    }
  },
  props: {},
  sockets: {
    connect: function () {
      console.log('socket connected')
    },
    cameras: function (data: any) {
      this.cameras = data;
    },
    latest_images: function (imageUrls: any) {
      this.imageUrls = imageUrls;
    },
    new_image: function (imageUrl: any) {

      this.newImageUrl = imageUrl;
      this.clearInterval(false);

      setTimeout(() => {
        // Hide new image
        this.newImageUrl = null;
        // Prepend new image and restrict to maxImages
        this.imageUrls = [imageUrl].concat(this.imageUrls.slice(0, this.maxImages-1));
        // End capturing
        this.clearInterval(true);
      }, 5000);
    },
    error: function (message: any) {
      console.error("Received error message from backend:", message);
      if (this.interval !== null || this.countdown != null) {

        // TODO: Hint error to user

        this.clearInterval(true)
      }
    },
  },
  mounted() {
    this.$socket.emit('get_latest_images', { count: this.maxImages })
  },
  methods: {
    clearInterval(endCapturing: boolean) {
      clearInterval(this.interval);
      this.countdown = null;
      if (endCapturing)
        this.isCapturing = false;
    },
    capture() {
      if (this.isCapturing) return;
      this.isCapturing = true;

      this.countdown = 3;
      this.newImageUrl = null;

      this.interval = setInterval(() => {
        if (this.countdown === null) this.clearInterval(false);

        this.countdown--;

        if (this.countdown == 1) {
          this.$socket.emit('capture');
        } else if (this.countdown == -5) {
          this.clearInterval(false)
        }
      }, 1000);

    }
  },
});
</script>
