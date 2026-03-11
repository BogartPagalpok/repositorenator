import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Form, Input, Select, Checkbox, notification } from 'antd';
import GitHubButton from 'react-github-btn';
import OAuth from 'react-oauth-flow';
import Terminal from 'xterm.js';
import 'xterm/css/xterm.css';
import './ConfigPanel.css';

const { Option } = Select;

const ConfigPanel = () => {
  const [form] = Form.useForm();
  const [frameworks, setFrameworks] = useState([]);
  const [lintingOptions, setLintingOptions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetch('/api/frameworks')
      .then(res => res.json())
      .then(data => setFrameworks(data));

    fetch('/api/linting')
      .then(res => res.json())
      .then(data => setLintingOptions(data));
  }, []);

  const handleSubmit = values => {
    setIsSaving(true);
    fetch('/api/save-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then(response => response.json())
      .then(() => notification.success({
        message: 'Configuration Saved',
        description: 'Your template preferences have been successfully saved!'
      }))
      .catch(() => notification.error({
        message: 'Error',
        description: 'An error occurred while saving your preferences.'
      }))
      .finally(() => setIsSaving(false));
  };

  const handleOAuthSuccess = response => {
    fetch('/api/push-repo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${response.access_token}`,
      },
      body: JSON.stringify(form.getFieldsValue()),
    })
      .then(() => notification.success({
        message: 'Repo Pushed',
        description: 'Your repository has been pushed to GitHub successfully!'
      }))
      .catch(() => notification.error({
        message: 'Error',
        description: 'An error occurred while pushing your repository to GitHub.'
      }));
  };

  const handleOAuthError = error => {
    notification.error({
      message: 'OAuth Error',
      description: 'Failed to authenticate with GitHub.'
    });
  };

  const downloadFiles = () => {
    fetch('/api/download-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.getFieldsValue()),
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'project.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="config-panel">
      <h2>Configuration Panel</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="projectName" label="Project Name" rules={[{ required: true, message: 'Please input your project name!' }]}> 
          <Input placeholder="Enter project name" />
        </Form.Item>
        <Form.Item name="cssFramework" label="CSS Framework">
          <Select placeholder="Select a CSS framework">
            {frameworks.map(framework => (
              <Option key={framework.id} value={framework.name}>{framework.displayName}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="lintingRules" label="Linting Rules"> 
          <Checkbox.Group>
            {lintingOptions.map(option => (
              <Checkbox key={option.id} value={option.value}>{option.label}</Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSaving}>Save Preferences</Button>
          <Button type="default" onClick={downloadFiles} style={{marginLeft: '20px'}}>Download Files</Button>
        </Form.Item>
      </Form>
      <OAuth
        authorizationUrl="https://github.com/login/oauth/authorize"
        clientId="YOUR_GITHUB_CLIENT_ID"
        redirectUri="YOUR_REDIRECT_URI"
        onSuccess={handleOAuthSuccess}
        onError={handleOAuthError}
      >
        <GitHubButton
          type="stargazers"
          namespace="yournamespace"
          repo="yourrepo"
          onClick={e => { e.preventDefault(); }}
        >Push to GitHub</GitHubButton>
      </OAuth>
      <div id="terminal" className="terminal"> </div>
    </div>
  );
};

export default ConfigPanel;