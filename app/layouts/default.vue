<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="flex-1 pt-24">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
