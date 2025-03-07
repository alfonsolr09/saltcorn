/**
 * @category saltcorn-builder
 * @module components/elements/Action
 * @subcategory components / elements
 */
/*global notifyAlert*/

import React, { Fragment, useContext } from "react";
import { useNode } from "@craftjs/core";
import optionsCtx from "../context";
import {
  BlockSetting,
  MinRoleSettingRow,
  OrFormula,
  ConfigForm,
  setInitialConfig,
  ButtonOrLinkSettingsRows,
  DynamicFontAwesomeIcon,
  setAPropGen,
  buildOptions,
} from "./utils";

export /**
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.block
 * @param {string} props.action_label
 * @param {string} props.action_style
 * @param {string} props.action_icon
 * @param {string} props.action_size
 * @param {string} props.action_bgcol
 * @param {string} props.action_bordercol
 * @param {string} props.action_textcol
 * @returns {span|btn}
 * @category saltcorn-builder
 * @subcategory components
 * @namespace
 */
const Action = ({
  name,
  block,
  action_label,
  action_style,
  action_icon,
  action_size,
  action_bgcol,
  action_bordercol,
  action_textcol,
}) => {
  const {
    selected,
    connectors: { connect, drag },
  } = useNode((node) => ({ selected: node.events.selected }));
  /**
   * @type {object}
   */
  return (
    <button
      className={`btn ${action_style || "btn-primary"} ${action_size || ""} ${
        selected ? "selected-node" : ""
      } ${block ? "d-block" : ""}`}
      ref={(dom) => connect(drag(dom))}
      style={
        action_style === "btn-custom-color"
          ? {
              backgroundColor: action_bgcol || "#000000",
              borderColor: action_bordercol || "#000000",
              color: action_textcol || "#000000",
            }
          : action_style === "on_page_load"
          ? {
              border: "1px red dashed",
            }
          : {}
      }
    >
      <DynamicFontAwesomeIcon icon={action_icon} className="me-1" />
      {action_label || name}
    </button>
  );
};

export /**
 * @category saltcorn-builder
 * @subcategory components
 * @namespace
 * @returns {div}
 */
const ActionSettings = () => {
  const node = useNode((node) => ({
    name: node.data.props.name,
    action_row_variable: node.data.props.action_row_variable,
    action_row_limit: node.data.props.action_row_limit,
    block: node.data.props.block,
    minRole: node.data.props.minRole,
    confirm: node.data.props.confirm,
    action_label: node.data.props.action_label,
    configuration: node.data.props.configuration,
    isFormula: node.data.props.isFormula,
    action_style: node.data.props.action_style,
    action_size: node.data.props.action_size,
    action_icon: node.data.props.action_icon,
    action_bgcol: node.data.props.action_bgcol,
    action_bordercol: node.data.props.action_bordercol,
    action_textcol: node.data.props.action_textcol,
  }));
  const {
    actions: { setProp },
    name,
    action_row_variable,
    action_row_limit,
    block,
    minRole,
    isFormula,
    confirm,
    configuration,
    action_label,
    action_style,
  } = node;
  const options = useContext(optionsCtx);
  const getCfgFields = (fv) => (options.actionConfigForms || {})[fv];
  const cfgFields = getCfgFields(name);
  const setAProp = setAPropGen(setProp);
  return (
    <div>
      <table className="w-100">
        <tbody>
          <tr>
            <td>
              <label>Action</label>
            </td>
            <td>
              <select
                value={name}
                className="form-control form-select"
                onChange={(e) => {
                  if (!e.target) return;
                  const value = e.target.value;
                  setProp((prop) => {
                    prop.name = value;
                    if (options.mode === "filter" && value !== "Clear") {
                      const rowRequired =
                        options.actionConstraints &&
                        options.actionConstraints[value]?.requireRow;
                      if (!action_row_variable) {
                        prop.action_row_variable = rowRequired
                          ? "state"
                          : "none";
                      } else if (
                        rowRequired &&
                        action_row_variable === "none"
                      ) {
                        prop.action_row_variable = "state";
                      }
                    }
                  });
                  setInitialConfig(setProp, value, getCfgFields(value));
                }}
              >
                {options.actions.map((f, ix) => (
                  <option key={ix} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          {name !== "Clear" && options.mode === "filter" ? (
            <tr>
              <td>
                <label>Row variable</label>
              </td>
              <td>
                <select
                  value={action_row_variable}
                  className="form-control form-select"
                  onChange={(e) => {
                    if (!e.target) return;
                    const value = e.target.value;
                    const rowRequired =
                      options.actionConstraints &&
                      options.actionConstraints[name]?.requireRow;
                    if (value === "none" && rowRequired) {
                      notifyAlert({
                        type: "warning",
                        text: `${name} requires a row, none is not possible`,
                      });
                    } else
                      setProp((prop) => (prop.action_row_variable = value));
                    setInitialConfig(setProp, value, getCfgFields(value));
                  }}
                >
                  {buildOptions(["none", "state", "each_matching_row"], {
                    valAttr: true,
                    keyAttr: true,
                  })}
                </select>
              </td>
            </tr>
          ) : null}
          {action_row_variable === "each_matching_row" ? (
            <tr>
              <td>
                <label>Rows limit</label>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={action_row_limit}
                  onChange={setAProp("action_row_limit")}
                />
              </td>
            </tr>
          ) : null}
          {action_style !== "on_page_load" ? (
            <tr>
              <td colSpan="2">
                <label>Label (leave blank for default)</label>
                <OrFormula
                  nodekey="action_label"
                  {...{ setProp, isFormula, node }}
                >
                  <input
                    type="text"
                    className="form-control"
                    value={action_label}
                    onChange={setAProp("action_label")}
                  />
                </OrFormula>
              </td>
            </tr>
          ) : null}
          <ButtonOrLinkSettingsRows
            setProp={setProp}
            keyPrefix="action_"
            values={node}
            allowRunOnLoad={true}
          />
          <MinRoleSettingRow minRole={minRole} setProp={setProp} />
        </tbody>
      </table>
      <div className="form-check">
        <input
          className="form-check-input"
          name="block"
          type="checkbox"
          checked={confirm}
          onChange={setAProp("confirm", { checked: true })}
        />
        <label className="form-check-label">User confirmation?</label>
      </div>
      {action_style !== "on_page_load" ? (
        <BlockSetting block={block} setProp={setProp} />
      ) : null}
      {cfgFields ? (
        <ConfigForm
          fields={cfgFields}
          configuration={configuration}
          setProp={setProp}
          node={node}
        />
      ) : null}
    </div>
  );
};

/**
 * @type {object}
 */
Action.craft = {
  displayName: "Action",
  related: {
    settings: ActionSettings,
  },
};
