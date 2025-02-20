import React, { FC, useEffect, useRef, useMemo } from "preact/compat";
import { useSortedCategories } from "../../../../hooks/useSortedCategories";
import { InstantMetricResult } from "../../../../api/types";
import Button from "../../../../components/Main/Button/Button";
import { RestartIcon, SettingsIcon } from "../../../../components/Main/Icons";
import Popper from "../../../../components/Main/Popper/Popper";
import "./style.scss";
import Checkbox from "../../../../components/Main/Checkbox/Checkbox";
import Tooltip from "../../../../components/Main/Tooltip/Tooltip";
import { useCustomPanelDispatch, useCustomPanelState } from "../../../../state/customPanel/CustomPanelStateContext";
import Switch from "../../../../components/Main/Switch/Switch";
import { arrayEquals } from "../../../../utils/array";
import classNames from "classnames";
import useDeviceDetect from "../../../../hooks/useDeviceDetect";
import useBoolean from "../../../../hooks/useBoolean";

const title = "Table settings";

interface TableSettingsProps {
  data: InstantMetricResult[];
  defaultColumns?: string[]
  onChange: (arr: string[]) => void
}

const TableSettings: FC<TableSettingsProps> = ({ data, defaultColumns = [], onChange }) => {
  const { isMobile } = useDeviceDetect();

  const { tableCompact } = useCustomPanelState();
  const customPanelDispatch = useCustomPanelDispatch();
  const columns = useSortedCategories(data);

  const buttonRef = useRef<HTMLDivElement>(null);

  const {
    value: openSettings,
    toggle: toggleOpenSettings,
    setFalse: handleClose,
  } = useBoolean(false);

  const disabledButton = useMemo(() => !columns.length, [columns]);

  const handleChange = (key: string) => {
    onChange(defaultColumns.includes(key) ? defaultColumns.filter(col => col !== key) : [...defaultColumns, key]);
  };

  const toggleTableCompact = () => {
    customPanelDispatch({ type: "TOGGLE_TABLE_COMPACT" });
  };

  const handleResetColumns = () => {
    handleClose();
    onChange(columns.map(col => col.key));
  };

  const createHandlerChange = (key: string) => () => {
    handleChange(key);
  };

  useEffect(() => {
    const values = columns.map(col => col.key);
    if (arrayEquals(values, defaultColumns)) return;
    onChange(values);
  }, [columns]);

  return (
    <div className="vm-table-settings">
      <Tooltip title={title}>
        <div ref={buttonRef}>
          <Button
            variant="text"
            startIcon={<SettingsIcon/>}
            onClick={toggleOpenSettings}
            disabled={disabledButton}
          />
        </div>
      </Tooltip>
      <Popper
        open={openSettings}
        onClose={handleClose}
        placement="bottom-right"
        buttonRef={buttonRef}
        title={title}
      >
        <div
          className={classNames({
            "vm-table-settings-popper": true,
            "vm-table-settings-popper_mobile": isMobile
          })}
        >
          <div className="vm-table-settings-popper-list vm-table-settings-popper-list_first">
            <Switch
              label={"Compact view"}
              value={tableCompact}
              onChange={toggleTableCompact}
            />
          </div>
          <div className="vm-table-settings-popper-list">
            <div className="vm-table-settings-popper-list-header">
              <h3 className="vm-table-settings-popper-list-header__title">Display columns</h3>
              <Tooltip title="Reset to default">
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  onClick={handleResetColumns}
                  startIcon={<RestartIcon/>}
                />
              </Tooltip>
            </div>
            {columns.map(col => (
              <div
                className="vm-table-settings-popper-list__item"
                key={col.key}
              >
                <Checkbox
                  checked={defaultColumns.includes(col.key)}
                  onChange={createHandlerChange(col.key)}
                  label={col.key}
                  disabled={tableCompact}
                />
              </div>
            ))}
          </div>
        </div>
      </Popper>
    </div>
  );
};

export default TableSettings;
