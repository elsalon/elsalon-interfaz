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
            <div class="w-full md:w-1/4 mt-4 md:mt-6 md:flex md:flex-col">
                <div class="flex justify-between items-center my-2">
                    <span class="font-medium pl-6 text-zinc-500 dark:text-zinc-400">Videos </span>
                    
                    <span class="text-xs mr-2 text-zinc-400 dark:text-zinc-500">{{currentVideo+1}}/{{ playlist.length }} ({{ totalDurationLabel }})</span>
                    <SelectButton v-model="loopMode" :options="loopOptions" size="small" :allowEmpty="false">
                         <template #option="slotProps" >
                            <i :class="slotProps.option.icon" v-tooltip.bottom="slotProps.option.label"></i>                              
                        </template>
                    </SelectButton>
                    <!-- {{ loopMode }} -->
                </div>
                <div ref="userListRef" class="userlist max-h-[300px] md:max-h-[calc(100vh-150px)] overflow-y-auto pr-2 scrollbar-container rounded-xl p-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                        <div 
                            v-for="(video,i) in playlist" 
                            :key="video.id" 
                            :ref="(element) => setPlaylistItemRef(element, i)"
                            @click="LoadVideo(video, i)"
                            class="cursor-pointer p-2 rounded-lg border border-transparent transition-colors flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                            :class="i === currentVideo ? 'bg-zinc-200/60 border-zinc-300 dark:bg-zinc-800/80 dark:border-zinc-700' : 'bg-transparent'"
                        >
                            <div class="w-2 h-full flex items-center">
                                <div v-if="i == currentVideo" class="w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
                            </div>
                            <AvatarSalon :usuario="video.identidad" size="small" style="font-size: .6rem;"/>
                            <div class="truncate flex-grow text-zinc-700 dark:text-zinc-200">
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
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
const { hooks } = useNuxtApp();
import qs from 'qs';

let startVideoPlaylistHook = null;

const visible = ref(false)
const loading = ref(true)
const playerRef = ref(null)
const userListRef = ref(null)
let player = null
const playlist = ref([])
const currentVideo = ref(0)
const playlistFinished = ref(false)
const playlistItemRefs = ref([])
const totalDurationSeconds = ref(0)
const totalDurationLoading = ref(false)

const isClosing = ref(false)
const originalUrl = ref(null)

const loopOptions = ref([
    { value: 'one' , label: 'Repetir Video', icon: 'pi pi-replay' },
    { value: 'all', label: 'Reproducir Playlist', icon: 'pi pi-list' },
])
const loopMode = ref(loopOptions.value[1])
let loopToggleButton = null
let durationCalcRequestId = 0
let probeContainer = null
let probePlayer = null

const ensureProbePlayer = () => {
    if (typeof window === 'undefined') return null
    if (probePlayer) return probePlayer

    probeContainer = document.createElement('div')
    probeContainer.style.position = 'fixed'
    probeContainer.style.left = '-9999px'
    probeContainer.style.top = '-9999px'
    probeContainer.style.width = '1px'
    probeContainer.style.height = '1px'

    const probeElement = document.createElement('video')
    probeContainer.appendChild(probeElement)
    document.body.appendChild(probeContainer)

    probePlayer = new Plyr(probeElement, {
        controls: [],
        autoplay: false,
        youtube: {
            rel: 0,
            modestbranding: 1,
        },
        vimeo: {
            dnt: true,
        },
    })

    return probePlayer
}

const destroyProbePlayer = () => {
    if (probePlayer) {
        try {
            probePlayer.destroy()
        } catch (_) {
            // ignore probe cleanup errors
        }
        probePlayer = null
    }

    if (probeContainer) {
        probeContainer.remove()
        probeContainer = null
    }
}

const formatDurationLabel = (seconds) => {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
    const totalMinutes = Math.round(safeSeconds / 60)

    if (totalMinutes < 60) {
        return `${totalMinutes}m`
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}h ${minutes}m`
}

const totalDurationLabel = computed(() => {
    if (totalDurationLoading.value) return '...'
    return formatDurationLabel(totalDurationSeconds.value)
})

const getDurationFromProbePlayer = (item) => {
    return new Promise((resolve) => {
        const currentProbePlayer = ensureProbePlayer()
        if (!currentProbePlayer) {
            resolve(0)
            return
        }

        let cleanedUp = false
        const cleanup = () => {
            if (cleanedUp) return
            cleanedUp = true
            clearTimeout(timeoutId)
        }

        const resolveWithDuration = () => {
            const duration = Number(currentProbePlayer.duration)
            if (Number.isFinite(duration) && duration > 0) {
                cleanup()
                resolve(duration)
            }
        }

        const timeoutId = setTimeout(() => {
            cleanup()
            resolve(0)
        }, 8000)

        currentProbePlayer.once('ready', resolveWithDuration)
        currentProbePlayer.once('durationchange', resolveWithDuration)
        currentProbePlayer.once('loadedmetadata', resolveWithDuration)

        currentProbePlayer.source = {
            type: 'video',
            sources: [
                {
                    src: item.id,
                    provider: item.provider || 'youtube',
                }
            ]
        }
    })
}

const calculateTotalPlaylistDuration = async (items) => {
    if (!items?.length) return 0

    let total = 0
    for (const item of items) {
        total += await getDurationFromProbePlayer(item)
    }

    return total
}

const getLoopModeValue = () => {
    if (typeof loopMode.value === 'string') return loopMode.value
    return loopMode.value?.value
}

const toggleLoopMode = () => {
    const nextMode = getLoopModeValue() === 'one' ? 'all' : 'one'
    loopMode.value = loopOptions.value.find(option => option.value === nextMode)
}

const updateLoopToggleButton = () => {
    if (!loopToggleButton) return

    const mode = getLoopModeValue()
    const isOne = mode === 'one'
    const iconClass = isOne ? 'pi pi-replay' : 'pi pi-list'
    const ariaLabel = isOne ? 'Cambiar a repetir playlist' : 'Cambiar a repetir video'

    loopToggleButton.setAttribute('aria-label', ariaLabel)
    loopToggleButton.setAttribute('aria-pressed', isOne ? 'true' : 'false')
    loopToggleButton.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`
}

const setPlaylistItemRef = (element, index) => {
    if (!element) {
        delete playlistItemRefs.value[index]
        return
    }

    playlistItemRefs.value[index] = element
}

const scrollCurrentVideoIntoView = async () => {
    if (currentVideo.value === null || currentVideo.value < 0) return

    await nextTick()

    const currentItem = playlistItemRefs.value[currentVideo.value]
    if (!currentItem) return

    currentItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
    })
}

const handleFullscreenHotkey = (event) => {
    if (event.key?.toLowerCase() !== 'f') return
    if (!visible.value || !player) return
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const activeTag = document.activeElement?.tagName?.toLowerCase()
    const isEditable = document.activeElement?.isContentEditable
    if (isEditable || activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return
    }

    event.preventDefault()
    player.fullscreen?.toggle()
}

const handlePlayPauseHotkey = (event) => {
    const key = event.key?.toLowerCase()
    const isSpace = event.code === 'Space' || event.key === ' ' || key === 'spacebar'
    if (key !== 'k' && !isSpace) return
    if (!visible.value || !player) return
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const activeTag = document.activeElement?.tagName?.toLowerCase()
    const isEditable = document.activeElement?.isContentEditable
    if (isEditable || activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return
    }

    event.preventDefault()
    player.togglePlay()
}

const handleSeekHotkey = (event) => {
    const key = event.key?.toLowerCase()
    if (key !== 'j' && key !== 'l') return
    if (!visible.value || !player) return
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const activeTag = document.activeElement?.tagName?.toLowerCase()
    const isEditable = document.activeElement?.isContentEditable
    if (isEditable || activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return
    }

    event.preventDefault()
    if (event.shiftKey) {
        if (key === 'l') {
            NextVideo()
        } else {
            PreviousVideo()
        }
    } else {
        if (key === 'l') {
            player.forward(10)
        } else {
            player.rewind(10)
        }
    }
}

const toggleMute = () => {
    if (!player) return
    player.muted = !player.muted
}

const handleMuteHotkey = (event) => {
    if (event.key?.toLowerCase() !== 'm') return
    if (!visible.value || !player) return
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const activeTag = document.activeElement?.tagName?.toLowerCase()
    const isEditable = document.activeElement?.isContentEditable
    if (isEditable || activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return
    }

    event.preventDefault()
    toggleMute()
}

const handleWindowBlur = () => {
    setTimeout(() => {
        if (visible.value && document.activeElement?.tagName === 'IFRAME') {
            window.focus()
        }
    }, 0)
}

const PreviousVideo = () => {
    if (!playlist.value.length) return

    if (playlistFinished.value) {
        const lastIndex = playlist.value.length - 1
        LoadVideo(playlist.value[lastIndex], lastIndex)
        return
    }

    if (currentVideo.value > 0) {
        const previousIndex = currentVideo.value - 1
        LoadVideo(playlist.value[previousIndex], previousIndex)
    } else {
        player?.restart()
    }
}

const NextVideo = () => {
    if (!playlist.value.length) return

    if (playlistFinished.value || currentVideo.value === null) {
        LoadVideo(playlist.value[0], 0)
        return
    }

    if (currentVideo.value < playlist.value.length - 1) {
        const nextIndex = currentVideo.value + 1
        LoadVideo(playlist.value[nextIndex], nextIndex)
    } else {
        // console.log("Playlist finished")
        currentVideo.value = null;
        playlistFinished.value = true;
    }
}

const HandleVideoEnded = () => {
    if (getLoopModeValue() === 'one') {
        player?.restart()
        player?.play().catch(err => console.warn("Autoplay failed:", err))
        return
    }

    NextVideo()
}

const AttachPlaylistControls = () => {
    if (!player?.elements?.controls) return

    const controls = player.elements.controls
    const playButton = controls.querySelector('[data-plyr="play"]')

    let prevButton = controls.querySelector('.plyr__control--playlist-prev')
    if (!prevButton) {
        prevButton = document.createElement('button')
        prevButton.type = 'button'
        prevButton.className = 'plyr__control plyr__control--playlist-prev'
        prevButton.setAttribute('aria-label', 'Video anterior')
        prevButton.innerHTML = '<svg class="plyr__icon" aria-hidden="true" style="transform: rotate(180deg);"><use xlink:href="#plyr-fast-forward"></use></svg>'
    }

    let nextButton = controls.querySelector('.plyr__control--playlist-next')
    if (!nextButton) {
        nextButton = document.createElement('button')
        nextButton.type = 'button'
        nextButton.className = 'plyr__control plyr__control--playlist-next'
        nextButton.setAttribute('aria-label', 'Video siguiente')
        nextButton.innerHTML = '<svg class="plyr__icon" aria-hidden="true"><use xlink:href="#plyr-fast-forward"></use></svg>'
    }

    let loopButton = controls.querySelector('.plyr__control--playlist-loop')
    if (!loopButton) {
        loopButton = document.createElement('button')
        loopButton.type = 'button'
        loopButton.className = 'plyr__control plyr__control--playlist-loop'
        loopButton.setAttribute('aria-label', 'Modo de Reproducción')
        loopButton.innerHTML = '<svg class="plyr__icon" aria-hidden="true"><use xlink:href="#plyr-fast-forward"></use></svg>'
    }

    if (playButton) {
        playButton.insertAdjacentElement('afterend', nextButton)
        playButton.insertAdjacentElement('afterend', prevButton)
    } else {
        controls.prepend(nextButton)
        controls.prepend(prevButton)
    }

    const settingsButton = controls.querySelector('[data-plyr="settings"]')
    if (settingsButton) {
        settingsButton.insertAdjacentElement('beforebegin', loopButton)
    } else {
        controls.append(loopButton)
    }

    prevButton.onclick = PreviousVideo
    nextButton.onclick = NextVideo
    loopButton.onclick = toggleLoopMode
    loopToggleButton = loopButton
    updateLoopToggleButton()
}

const InitPlayer = () => {
    player = new Plyr(playerRef.value, {
        youtube: {
            rel: 0, // Disables related videos
            modestbranding: 1,   // Removes YouTube logo
            iv_load_policy: 3,   // Hides annotations
            cc_load_policy: 0,   // Starts captions if available
            cc_lang_pref: 'es'   // Preferred caption language
        },
        vimeo: {
            byline: false,
            portrait: false,
            title: false,
            dnt: true,
        },
        captions: {
            active: false,
            language: 'es',
            update: true,
        },
        settings: ['captions', 'speed', 'loop'],
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
        autoplay: false, // Autoplay is often blocked unless muted
    })

    AttachPlaylistControls()

    // player.on('playing', () => {
    //     console.log("Video started playing")
    // })

    player.on('ended', () => {
        // console.log("Video playback finished")
        HandleVideoEnded()
    })

    player.on('ready', () => {
        AttachPlaylistControls()
    })
}

const LoadVideo = (item, index = 0) => {
    if (!player) {
        // console.log("Player not initialized")
        InitPlayer() // Initialize player first
    }

    // console.log("Loading video", item)

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
        // console.log("New video loaded")
        player.play().catch(err => console.warn("Autoplay failed:", err))
    })
}

const handleOpenVideoPlaylist = async (data) => {
    // console.log("OPENED VIDEO PLAYLIST", data)
    // Store the current URL before changing it
    originalUrl.value = window.location.pathname
    
    visible.value = true
    loading.value = true
    
    // Update URL without affecting browser history
    if (data.entrada && data.entrada.id) {
        window.history.replaceState(null, '', `/entradas/${data.entrada.id}/playlist`)
    }
    
    playlist.value = await ProcesarEntradaAPlaylist(data.entrada)
    totalDurationSeconds.value = 0
    totalDurationLoading.value = true
    const requestId = ++durationCalcRequestId

    calculateTotalPlaylistDuration(playlist.value)
        .then((duration) => {
            if (requestId !== durationCalcRequestId) return
            totalDurationSeconds.value = duration
        })
        .finally(() => {
            if (requestId !== durationCalcRequestId) return
            totalDurationLoading.value = false
        })

    // console.log("Generado playlist", playlist.value)
    nextTick(() => {
        LoadVideo(playlist.value[0])
        loading.value = false
    })
}

const ProcesarEntradaAPlaylist = async (entrada) => {
    // console.log("Procesando entrada", entrada)
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
    // console.log("Todos los comentarios", allComentarios)
    
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

watch(() => playlist.value.length, () => {
    playlistItemRefs.value = []
})

watch(() => currentVideo.value, () => {
    scrollCurrentVideoIntoView()
})

watch(() => loopMode.value, () => {
    updateLoopToggleButton()
})

watch(() => visible.value, (newValue) => {
  if (!newValue && !isClosing.value && originalUrl.value) {
        durationCalcRequestId++
    destroyProbePlayer()
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
            loopToggleButton = null
    }
  }
})

onMounted(() => {
    startVideoPlaylistHook = hooks.hook('videoplaylist:open', handleOpenVideoPlaylist)
    window.addEventListener('keydown', handleFullscreenHotkey)
    window.addEventListener('keydown', handlePlayPauseHotkey)
    window.addEventListener('keydown', handleSeekHotkey)
    window.addEventListener('keydown', handleMuteHotkey)
    window.addEventListener('blur', handleWindowBlur)
})

onUnmounted(() => {
    if (startVideoPlaylistHook) startVideoPlaylistHook()
    destroyProbePlayer()
    window.removeEventListener('keydown', handleFullscreenHotkey)
    window.removeEventListener('keydown', handlePlayPauseHotkey)
    window.removeEventListener('keydown', handleSeekHotkey)
    window.removeEventListener('keydown', handleMuteHotkey)
    window.removeEventListener('blur', handleWindowBlur)
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