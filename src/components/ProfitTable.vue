<template>
    <div class="tableHolder">
        <table>
            <thead>
                <tr>
                    <th>Crypto Name</th>
                    <th>Initial Price (USD)</th>
                    <th>Current Price (USD)</th>
                    <th>Amount</th>
                    <th>Day</th>
                    <th>Profit (USD)</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="el in data">
                    <td>{{ el.currency }}</td>
                    <td>{{ (el.price > 1 ? (el.price).toFixed(3) : el.price.toPrecision(3)) }}</td>
                    <td>{{ (todayData > 1 ? (todayData).toFixed(3) : todayData.toPrecision(3)) }}</td>
                    <td>{{ (el.amount).toFixed(3) }}</td>
                    <td>{{ el.date }}</td>
                    <td>{{ (el.profit).toFixed(3) }}</td>
                </tr>

            </tbody>
        </table>

        <table>
            <thead>
                <tr>
                    <th>Total Amount ({{ currency }})</th>
                    <th>Total Amount (USD)</th>
                    <th>Avarage Initial Price</th>

                    <th>Spend (USD)</th>
                    <th>Total Profit (USD)</th>
                    <!-- <th>Total Profit (%)</th> -->

                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ totalData.TotalAmount.toFixed(3) }}</td>
                    <td>{{ (totalData.TotalAmount * todayData).toFixed(3) }}</td>
                    <td>{{ (totalData.AvarageIntialPrice > 1 ? (totalData.AvarageIntialPrice).toFixed(3) :
                        totalData.AvarageIntialPrice.toPrecision(3)) }} </td>
                    <td>{{ totalData.TotalPrice.toFixed(3) }}</td>
                    <td>{{ totalData.TotalProfit.toFixed(3) }}</td>
                    <!-- <td>{{ (totalData.TotalProfit / 100).toFixed(3) }}</td> -->
                </tr>

            </tbody>
        </table>
    </div>

</template>

<script>
export default {
    data() {
        return {
            currency: null
        }
    },
    props: ["data", "todayData", "totalData", "currency"],
}
</script>

<style scoped>
.tableHolder {
    max-width: 100%;
    overflow-x: auto;
}

table {
    min-width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: #303030;
    color: #E0E0E0;
}

th,
td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
}

th {
    background-color: #0e0e0e;
}

tr:nth-child(even) {
    background-color: #0e0e0e;
}
</style>