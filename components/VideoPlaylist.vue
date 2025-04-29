<template>
    <FullScreenModal v-model:isOpen="visible">
        <!-- Loading state -->
        <div v-if="loading" class="w-full h-full flex items-center justify-center">
            <span class="texto-cargando">Cargando...</span> 
        </div>
        
        <!-- Content -->
        <div class="flex flex-col md:flex-row h-full w-full mx-auto p-2 md:p-4 gap-4" v-show="!loading">
            <!-- PLAYER SECTION - takes more space on desktop -->
            <div class="w-full md:w-3/4 flex items-center">
                <div class="w-full">
                    <div v-if="playlistFinished" class="w-full py-8 flex items-center justify-center">
                        <span class="text-2xl text-gray-500">Playlist terminó</span>
                    </div>
                    <div :class="{'opacity-0': playlistFinished}" class="aspect-video w-full shadow-sm overflow-hidden">
                        <video ref="playerRef" playsinline controls class="w-full h-full"></video>
                    </div>
                </div>
            </div>
            
            <!-- PLAYLIST SECTION - sidebar on desktop, bottom on mobile -->
            <div class="w-full md:w-1/4 mt-4 md:mt-0 md:flex md:flex-col">
                <div class="flex justify-between items-center my-2">
                    <span class="font-medium mb-2 pl-6">Videos </span>
                    <span class="text-xs text-gray-400 mr-2">{{currentVideo+1}}/{{ playlist.length }}</span>
                </div>
                <div class="max-h-[300px] md:max-h-[calc(100vh-150px)] overflow-y-auto pr-2 scrollbar-container">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                        <div 
                            v-for="(video,i) in playlist" 
                            :key="video.id" 
                            @click="LoadVideo(video, i)"
                            class="cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                            :class="{'bg-gray-100': i == currentVideo}"
                        >
                            <div class="w-2 h-full flex items-center">
                                <div v-if="i == currentVideo" class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <AvatarSalon :usuario="video.identidad" size="small" style="font-size: .6rem;"/>
                            <div class="truncate flex-grow">
                                {{ video.identidad.nombre }}
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </FullScreenModal>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
const { hooks } = useNuxtApp();
import qs from 'qs';

let startVideoPlaylistHook = null;

const visible = ref(false)
const loading = ref(true)
const playerRef = ref(null)
let player = null
const playlist = ref([])
const currentVideo = ref(0)
const playlistFinished = ref(false)

const isClosing = ref(false)
const originalUrl = ref(null)

const InitPlayer = () => {
    console.log("Initializing player")

    player = new Plyr(playerRef.value, {
        youtube: {
            rel: 0, // Disables related videos
            modestbranding: 1,   // Removes YouTube logo
            iv_load_policy: 3,   // Hides annotations
            cc_load_policy: 1,   // Starts captions if available
            cc_lang_pref: 'es'   // Preferred caption language
        },
        vimeo: {
            byline: false,
            portrait: false,
            title: false,
            dnt: true,
        },
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
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
    }
}

const handleOpenVideoPlaylist = async (data) => {
    console.log("OPENED VIDEO PLAYLIST", data)
    // Store the current URL before changing it
    originalUrl.value = window.location.pathname
    
    visible.value = true
    loading.value = true
    
    // Update URL without affecting browser history
    if (data.entrada && data.entrada.id) {
        window.history.replaceState(null, '', `/entradas/${data.entrada.id}/playlist`)
    }
    
    playlist.value = await ProcesarEntradaAPlaylist(data.entrada)
    console.log("Generado playlist", playlist.value)
    nextTick(() => {
        LoadVideo(playlist.value[0])
        loading.value = false
    })
}

const ProcesarEntradaAPlaylist = async (entrada) => {
    console.log("Procesando entrada", entrada)
    let allComentarios = [];
    let newPlaylist = []
    
    // Always fetch all comments to ensure we have the latest
    let query = {
        where: {
            entrada: {equals: entrada.id}
        },
        sort: 'createdAt',
        limit: 0 // Get all comments
    }
    
    const queryParams = qs.stringify(query, { encode: false });
    const res = await useAPI(`/api/comentarios?${queryParams}`)
    allComentarios = res.docs
    console.log("Todos los comentarios", allComentarios)
    
    // Start with videos from the main entry
    newPlaylist = CrearItemPlaylist(entrada)
    
    // Add videos from all comments
    allComentarios.forEach((comentario) => {
        newPlaylist = [...newPlaylist, ...CrearItemPlaylist(comentario)]
    })
    
    return newPlaylist;
}

const CrearItemPlaylist = (contenido) => {
    let items = []
    let identidad = contenido.autoriaGrupal ? contenido.grupo : contenido.autor;
    if(contenido.embedsYoutube !== ""){
        contenido.embedsYoutube.forEach((videoId) => {
            items.push({
                identidad: identidad,
                id: videoId,
                provider: 'youtube',
            })
        })
    }
    if(contenido.embedsVimeo !== ""){
        contenido.embedsVimeo.forEach((videoId) => {
            items.push({
                identidad: identidad,
                id: videoId,
                provider: 'vimeo',
            })
        })
    }
    return items;
    
}

watch(() => visible.value, (newValue) => {
  if (!newValue && !isClosing.value && originalUrl.value) {
    isClosing.value = true
    
    // Restore the original URL that was stored when opening the playlist
    window.history.replaceState(null, '', originalUrl.value)
    
    // Reset flags after a brief delay
    setTimeout(() => {
      isClosing.value = false
      originalUrl.value = null
    }, 100)
    
    // Clean up the player if it exists
    if (player) {
      player.destroy()
      player = null
    }
  }
})

onMounted(() => {
    startVideoPlaylistHook = hooks.hook('videoplaylist:open', handleOpenVideoPlaylist)
})

onUnmounted(() => {
    if (startVideoPlaylistHook) startVideoPlaylistHook()
})
</script>

<style scoped>
/* Custom scrollbar for playlist */
.scrollbar-container::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollbar-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.scrollbar-container::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* Additional mobile optimizations */
@media (max-width: 768px) {
  .flex-col {
    gap: 1rem;
  }
  
  /* Make playlist items more touch-friendly on mobile */
  .cursor-pointer {
    padding: 0.5rem;
  }
}
</style>