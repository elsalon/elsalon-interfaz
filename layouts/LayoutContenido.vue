<template>
    <div class="flex  flex-col">
      <header class="sticky top-0 flex h-16 items-center gap-4 z-50 px-4 md:px-6">
        <nav class="w-full flex flex-row justify-between">
            <a href="/"><img class="h-10 w-10 " src="/public/salon_logo_sm_192x192.png"></a>
            
            <div class="relative">
                <img class="h-10 w-10 object-cover rounded-full" src="https://randomuser.me/api/portraits/women/87.jpg" alt="Avatar">
                <div class="absolute inset-0 rounded-full"></div>
            </div>
        </nav>
        <!-- <slot name="header">
          




            
        </slot> -->
      </header>
      <main class="container-sm mx-auto">
        <slot />
      </main>
    </div>
  </template>