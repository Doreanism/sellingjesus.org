---
layout: false
title: Orders
head:
  - - meta
    - name: robots
      content: noindex
---

<script lang="ts" setup>

import OrdersDashboard from './_comp/OrdersDashboard.vue'

</script>

<ClientOnly>
    <OrdersDashboard />
</ClientOnly>
