<template>
  <NuxtLoadingIndicator color="#000" />
  <NuxtPage />
  <Toast position="bottom-left"/>
  <ConfirmDialog/>
</template>

<style>
html.dark {
  background-color: var(--background-dark);
}
</style>