import { useState } from 'react';
import type { DataType } from './types';
import { useStations, useGeoData, useDisplayedStations, useProvinceModal } from './hooks';
import { DataTypeMenu, MainMap, ProvinceModal } from './components';

/**
 * @brief Inicjalizacja mapy.
 * @return Widok mapy wraz z całą obsługą stanu.
 */
export default function MapView() {
    const [dataType, setDataType] = useState<DataType>('synop');

    const { synopStations, meteoStations, loading } = useStations(dataType);
    const { geoData, powiatGeoData } = useGeoData();
    const { displayedSynop, displayedMeteo, activeStations, allStations } = useDisplayedStations(
        dataType, synopStations, meteoStations, geoData
    );
    const modal = useProvinceModal({ dataType, geoData, powiatGeoData, allStations, activeStations });

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#ffffff', overflow: 'hidden' }}>
            <DataTypeMenu
                dataType={dataType}
                synopCount={synopStations.length}
                meteoCount={meteoStations.length}
                onChange={setDataType}
            />

            <MainMap
                dataType={dataType}
                loading={loading}
                isModalOpen={modal.isModalOpen}
                geoData={geoData}
                displayedSynop={displayedSynop}
                displayedMeteo={displayedMeteo}
                onSelectProvince={modal.handleSelectProvince}
            />

            {modal.isModalOpen && modal.selectedProvince && (
                <ProvinceModal
                    dataType={dataType}
                    selectedProvince={modal.selectedProvince}
                    selectedPowiat={modal.selectedPowiat}
                    modalTitle={modal.modalTitle}
                    provinceInfo={modal.provinceInfo}
                    provinceGeometry={modal.provinceGeometry}
                    provincePowiatFeatures={modal.provincePowiatFeatures}
                    provinceStationsShown={modal.provinceStationsShown}
                    powiatInfo={modal.powiatInfo}
                    powiatGeometry={modal.powiatGeometry}
                    powiatStations={modal.powiatStations}
                    onSelectPowiat={modal.setSelectedPowiat}
                    onClose={modal.closeModal}
                />
            )}
        </div>
    );
}
