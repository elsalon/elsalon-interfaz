<template>

    <Drawer v-model:visible="visible" header=" " position="full">
        <div class="flex w-full h-full">
            <!-- PLAYER -->
            <div class="flex-grow items-center justify-center">
                <video ref="playerRef" playsinline controls></video>
            </div>
            <!-- PLAYLSIT -->
            <div class="w-1/4 px-2 overflow-y-auto">
                <div v-for="video in playlist" class="cursor-pointer p-1 hover:bg-gray-100" :key="video.id" @click="loadVideo(video.id)">
                    {{ video.title }}
                </div>
            </div>
        </div>
    </Drawer>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
const { hooks } = useNuxtApp();

let startVideoPlaylistHook = null;

const visible = ref(true)
const playerRef = ref(null)
let player = null
const playlist = ref([{title:'tst', id:"MGRDy2PqCGk"}, {title:'tst2', id:"MiE4RwNhfDI"}])

const test = () => {
    loadVideo("MGRDy2PqCGk")
}
const InitPlayer = () => {
    console.log("Initializing player")

    player = new Plyr(playerRef.value, {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        autoplay: false, // Autoplay is often blocked unless muted
    })

    player.on('playing', () => {
        console.log("Video started playing")
    })

    player.on('ended', () => {
        console.log("Video playback finished")
    })
}

const loadVideo = (id) => {
    console.log(player)
    if (!player) {
        console.log("Player not initialized")
        InitPlayer() // Initialize player first
    }

    console.log("Loading video", id)

    player.source = {
        type: 'video',
        sources: [
            {
                src: id,
                provider: 'youtube'
            }
        ]
    }

    player.once('ready', () => {
        console.log("New video loaded")
        player.play().catch(err => console.warn("Autoplay failed:", err))
    })
}

const handleOpenVideoPlaylist = async (data) => {
    console.log("OPENED VIDEO PLAYLIST", data)
    visible.value = true
    nextTick(() => {
        loadVideo("MiE4RwNhfDI")
    })
}

watch(() => visible.value, (newValue) => {
    if (!newValue && player) {
        player.destroy()
        player = null
    }
})

onMounted(() => {
    startVideoPlaylistHook = hooks.hook('videoplaylist:open', handleOpenVideoPlaylist)
})

onUnmounted(() => {
    if (startVideoPlaylistHook) startVideoPlaylistHook()
})
</script>