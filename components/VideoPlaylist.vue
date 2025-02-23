<template>


    <Dialog v-model:visible="visible" header=" " position="full" ref="maxDialog" :blockScroll="true"
        @show="biggifyDialog" :class="['!bg-white']" :pt="{ header: ['bg-white flex justify-between w-full p-2 '] }">

        <div class="w-full h-full md:flex items-center justify-center" :class="{'flex':loading}">
            <div v-if="loading">
                <span class="texto-cargando">Cargando...</span>
            </div>

            <div class=" md:flex w-full gap-4 md:flex-row flex-col" v-show="!loading">
                <!-- PLAYER (Defines the height) -->
                <div class="flex-grow md:flex items-center justify-center sticky top-0 z-10">
                    <div v-if="playlistFinished" class="w-full h-30 flex items-center justify-center absolute">
                        <span class="text-2xl text-gray-500">Playlist terminó</span>
                    </div>
                    <div :class="{ 'opacity-0': playlistFinished }" class="w-full transition-opacity">
                        <video ref="playerRef" playsinline controls class="w-full h-auto"></video>
                    </div>
                </div>

                <!-- PLAYLIST (Inherits video height) -->
                <div class=" w-full md:w-1/5 p-1 bg-white flex flex-col overflow-y-auto overflow-hidden relative scrollbar z-0">
                    <div class="md:absolute md:w-full h-full top-0 left-0">
                        <div v-for="(video, i) in playlist" ref="videoItems"
                            class="cursor-pointer p-3 hover:bg-gray-200 flex items-center gap-2 rounded-sm"
                            :key="video.id" @click="LoadVideo(video, i)">
                            <div class="w-2">
                                <div v-if="i == currentVideo" class="w-2 h-2 bg-black rounded-full"></div>
                            </div>
                            
                            <AvatarSalon :usuario="video.identidad" size="small" style="font-size: .6rem;" />
                            <div>
                                {{ video.identidad.nombre }}
                                <div class="text-gray-400 text-xs">
                                    <time :datetime="video.createdAt" class="text-gray-400 text-xs">{{ $formatDate(video.createdAt) }}</time>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
const { hooks } = useNuxtApp();
const { $formatDate } = useNuxtApp()
import qs from 'qs';

let startVideoPlaylistHook = null;


const visible = ref(false)
const loading = ref(true)
const playerRef = ref(null)
let player = null
const playlist = ref([])
const videoItems = ref([]); // element refs

const currentVideo = ref(0)
const playlistFinished = ref(false)

const maxDialog = ref();

function biggifyDialog() {
    maxDialog.value.maximized = true;
}

const InitPlayer = () => {
    console.log("Initializing player")

    player = new Plyr(playerRef.value, {
        // controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'airplay', 'fullscreen'],
        autoplay: false, // Autoplay is often blocked unless muted
    })

    player.on('playing', () => {
        console.log("Video started playing")
    })

    player.on('ended', () => {
        console.log("Video playback finished")
        NextVideo();
    })
}

const LoadVideo = (item, index = 0) => {
    if (!player) {
        console.log("Player not initialized")
        InitPlayer() // Initialize player first
    }

    console.log("Loading video", item)

    player.source = {
        type: 'video',
        sources: [
            {
                src: item.id,
                provider: item.provider || 'youtube',
            }
        ]
    }
    currentVideo.value = index
    playlistFinished.value = false;

    videoItems.value[index].scrollIntoView({ behavior: "smooth", block: "nearest" });

    player.once('ready', () => {
        console.log("New video loaded")
        player.play().catch(err => console.warn("Autoplay failed:", err))
    })
}

const NextVideo = () => {
    if (currentVideo.value < playlist.value.length - 1) {
        currentVideo.value++
        LoadVideo(playlist.value[currentVideo.value], currentVideo.value)
    } else {
        console.log("Playlist finished")
        currentVideo.value = null;
        playlistFinished.value = true;
        // Exit fullscreen
        player.fullscreen.exit()
    }
}

const handleOpenVideoPlaylist = async (data) => {
    console.log("OPENED VIDEO PLAYLIST", data)
    visible.value = true
    loading.value = true
    playlist.value = await ProcesarEntradaAPlaylist(data.entrada)
    console.log("Generado playlist", playlist.value)
    nextTick(() => {
        LoadVideo(playlist.value[0])
        loading.value = false
    })
}

const ProcesarEntradaAPlaylist = async (entrada) => {
    console.log("Procesando entrada", entrada)
    let extraComentarios = [];
    let newPlaylist = []
    if (entrada.comentarios.totalDocs > entrada.comentarios.docs.length) {
        // No estan cargados todos los comentarios, tengo que cargar más.
        console.log("Cargando más comentarios")
        const oldestCommentDate = entrada.comentarios.docs[0].createdAt;
        let query = {
            where: {
                and: [
                    { entrada: { equals: entrada.id } },
                    { createdAt: { less_than: oldestCommentDate } },
                ]
            },
            sort: '-createdAt',
            limit: 0,
        }
        // Cargo solo los extra, no los que ya tengo
        const queryParams = qs.stringify(query, { encode: false });
        const res = await useAPI(`/api/comentarios?${queryParams}`)
        extraComentarios = res.docs
        console.log("Extra comentarios", extraComentarios)
    }
    newPlaylist = CrearItemPlaylist(entrada)
    extraComentarios.forEach((comentario) => {
        newPlaylist = [...newPlaylist, ...CrearItemPlaylist(comentario)]
    })
    entrada.comentarios.docs.forEach((comentario) => {
        newPlaylist = [...newPlaylist, ...CrearItemPlaylist(comentario)]
    })
    return newPlaylist;
}

const CrearItemPlaylist = (contenido) => {
    let items = []
    let identidad = contenido.autoriaGrupal ? contenido.grupo : contenido.autor;
    if (contenido.embedsYoutube !== "") {
        contenido.embedsYoutube.forEach((videoId) => {
            items.push({
                identidad: identidad,
                id: videoId,
                provider: 'youtube',
                createdAt: contenido.createdAt,
            })
        })
    }
    if (contenido.embedsVimeo !== "") {
        contenido.embedsVimeo.forEach((videoId) => {
            items.push({
                identidad: identidad,
                id: videoId,
                provider: 'vimeo',
                createdAt: contenido.createdAt,
            })
        })
    }
    return items;

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
