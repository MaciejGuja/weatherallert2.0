import { useState } from 'react';
import type { DataType } from './types';
import { useStations, useGeoData, useDisplayedStations, useProvinceModal } from './hooks';
import { DataTypeMenu, MainMap, ProvinceModal } from './components';

/**
 * @brief Inicjalizacja mapy.
 * @return Widok mapy wraz z całą obsługą stanu.
 */
type MapProps={
    translateKey: Map<string, string>;
}
export default function MapView({translateKey}: MapProps) {
    const [dataType, setDataType] = useState<DataType>('synop');

    const { synopStations, meteoStations, hydroStations, loading } = useStations(dataType);
    const { geoData, powiatGeoData } = useGeoData();
    const { displayedSynopStations, displayedMeteoStations, activeStations, allStations, stationCount } = useDisplayedStations(
        dataType, synopStations, meteoStations
    );
    const modal = useProvinceModal({ dataType, geoData, powiatGeoData, allStations, activeStations });

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#ffffff', overflow: 'hidden' }}>

            <MainMap
                dataType={dataType}
                loading={loading}
                isModalOpen={modal.isModalOpen}
                geoData={geoData}
                displayedSynop={displayedSynopStations}
                displayedMeteo={displayedMeteoStations}
                onSelectProvince={modal.handleSelectProvince}
                translateKey={translateKey}
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
                    translateKey={translateKey}
                />
            )}
            <DataTypeMenu
                dataType={dataType}
                synopCount={synopStations.length}
                meteoCount={meteoStations.length}
                onChange={setDataType}
                translateKey={translateKey}
            />
        </div>
    );
}
