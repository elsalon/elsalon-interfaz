<template>
    
    <div class="flex container min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
        
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <img src="/salon_logo_lg_600x80.png" class="m-auto">
            
            <h2 class="mt-10 text-center text-2xl leading-9 tracking-tight text-zinc-900">
                <slot name="cta">
                    Iniciá sesión
                </slot>
            </h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

        <slot />
        
    </div>
  </div>
</template>