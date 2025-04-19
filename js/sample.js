window.onload = async function () {
    try {
        const groupA = {
            "a1": { name: "A-レイヤ1", color: "#FF6591" },
            "a2": { name: "A-レイヤ2", color: "#FFB6C1" }
        };
        const groupB = {
            "b1": { name: "B-レイヤ1", color: "#7C7AE0" },
            "b2": { name: "B-レイヤ2", color: "#B0AEEE" }
        };

        buildLayerPanel("group-a", groupA);
        buildLayerPanel("group-b", groupB);
    } catch (error) {
        console.error("データの読み込みに失敗しました", error);
    }
};
