export const convertStatName = (statName: string) => {
    return statName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}