<template>
    <header class="sticky top-0 flex h-16 items-center z-50 px-4 md:px-6" style="position:absolute">
        <Avatar label="S" style="background-color: #000; color: #fff" size="large" shape=""/>
    </header>
    
    <div class="flex container min-h-screen flex-col justify-center px-6 py-12 lg:px-8">

        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <!-- <img class="mx-auto w-auto" src="/public/salon_logo_lg_600x80.png" alt="El Salon"> -->
            <h2 class="mt-10 text-center text-2xl leading-9 tracking-tight text-gray-900">
                <slot name="cta">
                    Iniciá sesión en El Salón
                </slot>
            </h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

        <slot />
        
    </div>
  </div>
</template>