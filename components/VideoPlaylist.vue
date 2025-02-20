<template>

    <Drawer v-model:visible="visible" header=" " position="full">

        <div>
            <video ref="playerRef" playsinline controls></video>
        </div>
        <Button @click="test">test</Button>
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

const test = () => {
    loadVideo("MGRDy2PqCGk")
}
const InitPlayer = () => {
    console.log("Initializing player")

    player = new Plyr(playerRef.value, {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        autoplay: false, // Autoplay is often blocked unless muted
    })

    player.on('ready', () => {
        console.log("Player is ready")
    })

    player.on('playing', () => {
        console.log("Video started playing")
    })

    player.on('ended', () => {
        console.log("Video playback finished")
    })
}

const loadVideo = (id) => {
    if (!player) {
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
        player.stop();
    }
})

onMounted(() => {
    startVideoPlaylistHook = hooks.hook('videoplaylist:open', handleOpenVideoPlaylist)
})

onUnmounted(() => {
    if (startVideoPlaylistHook) startVideoPlaylistHook()
})
</script>