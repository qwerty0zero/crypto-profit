<template>
    <div class="selectDiv">
        <v-select :filter="fuseSearch" :options="list"
            :get-option-label="(option) => option.name + ` (${option.SYMBOL})`" placeholder="Choose Cypto"
            v-model="selected" @update:model-value="$emit('getElement', selected)">

            <template #option="{ name, SYMBOL, logoUrl }" class="selectHolder">
                <div class="selectHolder">
                    <img :src="logoUrl" alt="">
                    {{ name }} {{ ` (${SYMBOL})` }}
                </div>
            </template>
        </v-select>
    </div>

</template>

<script>
import Fuse from 'fuse.js'
import vSelect from 'vue-select'

import 'vue-select/dist/vue-select.css'

export default {
    data() {
        return {
            selected: null,
        }
    },
    props: ['list'],
    methods: {
        fuseSearch(options, search) {
            const fuse = new Fuse(options, {
                keys: ['SYMBOL', 'name'],
                shouldSort: true,
            })
            return search.length
                ? fuse.search(search).map(({ item }) => item)
                : fuse.list
        },
    },

    components: {
        vSelect
    },
}

</script>

<style scoped>
.selectDiv ::v-deep() {
    --vs-controls-color: #E0E0E0;
    --vs-border-color: none;

    --vs-dropdown-bg: #303030;
    --vs-dropdown-option-color: #E0E0E0;

    --vs-selected-bg: #303030;
    --vs-selected-color: #E0E0E0;

    --vs-search-input-color: #E0E0E0;

    --vs-dropdown-option--active-bg: #303030;
    --vs-dropdown-option--active-color: #cc99cd;
}

.selectDiv {
    border-radius: 5px;
}

.selectHolder {
    display: flex;
    align-items: center;
    background: #303030;
    gap: 10px;
}

.selectHolder img {
    border-radius: 50%;
    width: 24px;
    height: 24px;

}

.vs--searchable .vs__dropdown-toggle,
.selectDiv {
    background: #303030;
}

.selectDiv>.v-select>.vs__dropdown-toggle {
    padding: 0 0 6px;
    background: #303030;

}
</style>