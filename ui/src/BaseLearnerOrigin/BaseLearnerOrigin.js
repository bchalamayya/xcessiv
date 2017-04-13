import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import ContentEditable from 'react-contenteditable';
import MetricGenerators from './MetricGenerators';
import { isEqual, omit } from 'lodash';
import $ from 'jquery';
import ReactModal from 'react-modal';

const default_metric_generator_code = `def metric_generator(y_true, y_probas):
    """This function must return a numerical value given two numpy arrays 
    containing the ground truth labels and generated meta-features, in that order.
    (In this example, \`y_true\` and \`y_probas\`)
    """
    return 0.88
`

function ValidationResults(props) {
  const items = [];
  for (var key in props.validation_results) {
      items.push(<li key={key}>{key + ': ' + props.validation_results[key]}</li>)
    }
  return <div>
    <h4>Base learner metrics on toy data</h4>
    <ul>{items}</ul>
  </div>
}

function ClearModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Clear Changes'
      style={{
        overlay : {
          zIndex            : 1000
        },
        content : {
          top                        : '50%',
          left                       : '50%',
          right                      : 'auto',
          bottom                     : 'auto',
          marginRight                : '-50%',
          transform                  : 'translate(-50%, -50%)',
          border                     : '1px solid #ccc',
          background                 : '#fff',
          overflow                   : 'auto',
          WebkitOverflowScrolling    : 'touch',
          borderRadius               : '4px',
          outline                    : 'none',
          padding                    : '20px'
        }
      }}
    >
      <p>Are you sure you want to clear all unsaved changes?</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
}

class BaseLearnerOrigin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: 'Edit base learner origin name',
      meta_feature_generator: '',
      metric_generators: {'Accuracy': ''},
      source: '',
      final: false,
      validation_results: {},
      same: true,
      showClearModal: false
    };
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleChangeSource = this.handleChangeSource.bind(this);
    this.handleChangeMetaFeatureGenerator = this.handleChangeMetaFeatureGenerator.bind(this);
    this.handleChangeMetricGenerator = this.handleChangeMetricGenerator.bind(this);
    this.handleAddMetricGenerator = this.handleAddMetricGenerator.bind(this);
    this.clearChanges = this.clearChanges.bind(this);
    this.handleOpenClearModal = this.handleOpenClearModal.bind(this);
    this.handleCloseClearModal = this.handleCloseClearModal.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
    this.verifyLearner = this.verifyLearner.bind(this);
  }

  // Returns true if changing value of 'key' to 'value' in state will result in
  // different state from that stored in database.
  stateNoChange(key, value) {
    var nextState = omit(this.state, ['same', 'showClearModal']);
    nextState[key] = value
    return isEqual(nextState, this.savedState);
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learner-origins/' + this.props.id + '/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.savedState = omit(json, 'id');
      this.setState(this.savedState);
    });
  }

  // Change name of base learner origin
  handleChangeTitle(evt) {
    console.log(evt.target.value);
    console.log(this.stateNoChange('name', evt.target.value));
    this.setState({name: evt.target.value, 
      same: this.stateNoChange('name', evt.target.value)});
  }

  // Change source code
  handleChangeSource(value) {
    console.log(value);
    this.setState({source: value,
      same: this.stateNoChange('source', value)});
  }

  // Change meta-feature generator
  handleChangeMetaFeatureGenerator(event) {
    console.log(event.target.value);
    this.setState({meta_feature_generator: event.target.value,
      same: this.stateNoChange('meta_feature_generator', event.target.value)});
  }

  // Change metric generator
  handleChangeMetricGenerator(metric_name, source) {
    console.log(metric_name);
    console.log(source);
    var new_metric_generators = JSON.parse(JSON.stringify(this.state.metric_generators));
    new_metric_generators[metric_name] = source;
    this.setState({
      metric_generators: new_metric_generators,
      same: this.stateNoChange('metric_generators', new_metric_generators)
    });
  }

  // Add new metric generator
  handleAddMetricGenerator(metric_name) {
    console.log(metric_name);
    if (!(metric_name in this.state.metric_generators)) {
      var new_metric_generators = JSON.parse(JSON.stringify(this.state.metric_generators));
      new_metric_generators[metric_name] = default_metric_generator_code;
      this.setState({
        metric_generators: new_metric_generators,
        same: this.stateNoChange('metric_generators', new_metric_generators)
      });
    }
  }

  // Clear any unsaved changes
  clearChanges() {
    this.setState($.extend({}, {same: true, showClearModal: false}, this.savedState));
  }

  handleOpenClearModal() {
    this.setState({showClearModal: true});
  }

  handleCloseClearModal() {
    this.setState({showClearModal: false});
  }

  // Save any changes to server
  saveSetup() {
    var payload = {
      name: this.state['name'],
      meta_feature_generator: this.state['meta_feature_generator'],
      metric_generators: this.state['metric_generators'],
      source: this.state['source']
    };

    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/?path=' + this.props.path,
      {
        method: "PATCH",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      })
      .then(response => response.json())
      .then(json => {
      console.log(json)
      this.savedState = omit(json, 'id');
      this.setState($.extend({}, {same: true}, this.savedState));
    });
  }

  // Verify Base Learner Origin + Metric Generators
  verifyLearner() {

    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/verify/?path=' + this.props.path,
      )
      .then(response => response.json())
      .then(json => {
      console.log(json)
      this.savedState = omit(json, 'id');
      this.setState($.extend({}, {same: true}, this.savedState));
    });
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <div className='BaseLearnerOrigin'>
        <h3>
          {!this.state.same && '*'}
          <ContentEditable html={this.state.name} 
          disabled={false} 
          onChange={this.handleChangeTitle} />
        </h3>
        <CodeMirror value={this.state.source} 
        onChange={this.handleChangeSource} 
        options={options}/>
        <div className='SplitFormLabel'>
          <label>
            Meta-feature generator method: 
            <input type='text' 
            value={this.state.meta_feature_generator} 
            onChange={this.handleChangeMetaFeatureGenerator}/>
          </label>
        </div>
        <MetricGenerators 
        generators={this.state.metric_generators} 
        onGeneratorChange={this.handleChangeMetricGenerator} 
        handleAddMetricGenerator={this.handleAddMetricGenerator} />
        <ValidationResults validation_results={this.state.validation_results} />
        <button disabled={this.state.same}
        onClick={this.handleOpenClearModal}> Clear unsaved changes </button>
        <ClearModal isOpen={this.state.showClearModal} 
        onRequestClose={this.handleCloseClearModal}
        handleYes={this.clearChanges} />
        <button disabled={this.state.same} 
        onClick={this.saveSetup}> Save Base Learner Setup</button>
        <button disabled={!this.state.same} 
        onClick={this.verifyLearner}>Verify on toy data</button>
      </div>
    )
  }
}


export default BaseLearnerOrigin;